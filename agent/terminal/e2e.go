// End-to-end encryption between the browser and this service. The bridge (and Cloudflare) only relay
// ciphertext, so they cannot read or change what is typed or printed.
//
// The service owns a long-lived ECDSA P-256 identity key (terminal.key next to agent.conf). Its
// fingerprint is what the user compares in the browser once, like an SSH host key. For every shell:
//
//	browser -> service  {"t":"key","id":N,"pub":<browser ephemeral ECDH P-256 public key, 65 bytes, base64>}
//	service -> browser  {"t":"key","id":N,"pub":<service ephemeral key>,"ident":<identity public key>,"sig":<r||s>}
//
// sig is an ECDSA/SHA-256 signature of label || browserPub || servicePub, so a relay that sits in the
// middle cannot answer in place of the service. The two traffic keys are HKDF-SHA256 of the ECDH
// secret (salt = SHA-256 of that transcript, info = label + " c2s" or " s2c"). Frames are AES-256-GCM
// with an implicit 64-bit counter as nonce per direction, so a dropped, repeated or reordered frame
// fails to decrypt and ends the session.
package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdh"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"encoding/pem"
	"errors"
	"fmt"
	"os"
	"sync"
)

const e2eLabel = "rackatlas-terminal-e2e-v1"

type identity struct {
	key *ecdsa.PrivateKey
	pub []byte // 65 bytes, uncompressed point
}

// loadIdentity reads the identity key, or creates it (root only, mode 0600) when there is none yet.
func loadIdentity(path string) (*identity, error) {
	data, err := os.ReadFile(path)
	if errors.Is(err, os.ErrNotExist) {
		return createIdentity(path)
	}
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(data)
	if block == nil {
		return nil, fmt.Errorf("%s is not a PEM file", path)
	}

	parsed, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		return nil, err
	}

	key, ok := parsed.(*ecdsa.PrivateKey)
	if !ok || key.Curve != elliptic.P256() {
		return nil, fmt.Errorf("%s is not an ECDSA P-256 key", path)
	}

	return newIdentity(key)
}

func createIdentity(path string) (*identity, error) {
	key, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return nil, err
	}

	der, err := x509.MarshalPKCS8PrivateKey(key)
	if err != nil {
		return nil, err
	}

	file, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o600)
	if err != nil {
		return nil, err
	}

	if err := pem.Encode(file, &pem.Block{Type: "PRIVATE KEY", Bytes: der}); err != nil {
		file.Close()
		os.Remove(path)
		return nil, err
	}

	if err := file.Close(); err != nil {
		os.Remove(path)
		return nil, err
	}

	return newIdentity(key)
}

func newIdentity(key *ecdsa.PrivateKey) (*identity, error) {
	pub, err := key.PublicKey.ECDH()
	if err != nil {
		return nil, err
	}

	return &identity{key: key, pub: pub.Bytes()}, nil
}

// fingerprint looks like an SSH one: SHA256:<base64 without padding> of the public key point.
func (i *identity) fingerprint() string {
	sum := sha256.Sum256(i.pub)

	return "SHA256:" + base64.RawStdEncoding.EncodeToString(sum[:])
}

type keyReply struct {
	T     string `json:"t"`
	ID    uint32 `json:"id"`
	Pub   string `json:"pub"`
	Ident string `json:"ident"`
	Sig   string `json:"sig"`
}

// accept answers the key of the browser and returns the encrypted channel for that shell.
func (i *identity) accept(id uint32, browserPubB64 string) ([]byte, *secureSession, error) {
	browserPub, err := base64.StdEncoding.DecodeString(browserPubB64)
	if err != nil || len(browserPub) != 65 {
		return nil, nil, errors.New("invalid browser key")
	}

	curve := ecdh.P256()

	remote, err := curve.NewPublicKey(browserPub)
	if err != nil {
		return nil, nil, errors.New("invalid browser key")
	}

	ephemeral, err := curve.GenerateKey(rand.Reader)
	if err != nil {
		return nil, nil, err
	}

	secret, err := ephemeral.ECDH(remote)
	if err != nil {
		return nil, nil, err
	}

	servicePub := ephemeral.PublicKey().Bytes()

	transcript := append(append([]byte(e2eLabel), browserPub...), servicePub...)
	digest := sha256.Sum256(transcript)

	r, s, err := ecdsa.Sign(rand.Reader, i.key, digest[:])
	if err != nil {
		return nil, nil, err
	}

	sig := make([]byte, 64)
	r.FillBytes(sig[:32])
	s.FillBytes(sig[32:])

	session, err := newSession(secret, digest[:], false)
	if err != nil {
		return nil, nil, err
	}

	reply, err := json.Marshal(keyReply{
		T:     "key",
		ID:    id,
		Pub:   base64.StdEncoding.EncodeToString(servicePub),
		Ident: base64.StdEncoding.EncodeToString(i.pub),
		Sig:   base64.StdEncoding.EncodeToString(sig),
	})
	if err != nil {
		return nil, nil, err
	}

	return reply, session, nil
}

// hkdf32 is HKDF-SHA256 (RFC 5869) for exactly one block of output.
func hkdf32(secret, salt []byte, info string) []byte {
	extract := hmac.New(sha256.New, salt)
	extract.Write(secret)
	prk := extract.Sum(nil)

	expand := hmac.New(sha256.New, prk)
	expand.Write([]byte(info))
	expand.Write([]byte{1})

	return expand.Sum(nil)
}

type secureSession struct {
	sealer  cipher.AEAD
	opener  cipher.AEAD
	sealMu  sync.Mutex
	openMu  sync.Mutex
	sealCnt uint64
	openCnt uint64
}

// newSession derives both directions. The service seals with s2c and opens with c2s;
// browserSide flips that, which the tests use to play the browser.
func newSession(secret, salt []byte, browserSide bool) (*secureSession, error) {
	c2s, err := newGCM(hkdf32(secret, salt, e2eLabel+" c2s"))
	if err != nil {
		return nil, err
	}

	s2c, err := newGCM(hkdf32(secret, salt, e2eLabel+" s2c"))
	if err != nil {
		return nil, err
	}

	if browserSide {
		return &secureSession{sealer: c2s, opener: s2c}, nil
	}

	return &secureSession{sealer: s2c, opener: c2s}, nil
}

func newGCM(key []byte) (cipher.AEAD, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	return cipher.NewGCM(block)
}

func counterNonce(counter uint64) []byte {
	nonce := make([]byte, 12)
	binary.BigEndian.PutUint64(nonce[4:], counter)

	return nonce
}

func (s *secureSession) seal(plain []byte) []byte {
	s.sealMu.Lock()
	defer s.sealMu.Unlock()

	out := s.sealer.Seal(nil, counterNonce(s.sealCnt), plain, nil)
	s.sealCnt++

	return out
}

func (s *secureSession) open(data []byte) ([]byte, error) {
	s.openMu.Lock()
	defer s.openMu.Unlock()

	plain, err := s.opener.Open(nil, counterNonce(s.openCnt), data, nil)
	if err != nil {
		return nil, err
	}

	s.openCnt++

	return plain, nil
}

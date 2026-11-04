package main

import (
	"crypto/ecdh"
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"math/big"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// browser plays the part of the web page: it builds the transcript and the keys the same way.
func handshakeAsBrowser(t *testing.T, id *identity) (*secureSession, *secureSession, string) {
	t.Helper()

	curve := ecdh.P256()
	priv, err := curve.GenerateKey(rand.Reader)
	if err != nil {
		t.Fatal(err)
	}

	browserPub := priv.PublicKey().Bytes()
	replyJSON, service, err := id.accept(7, base64.StdEncoding.EncodeToString(browserPub))
	if err != nil {
		t.Fatal(err)
	}

	var reply keyReply
	if err := json.Unmarshal(replyJSON, &reply); err != nil {
		t.Fatal(err)
	}

	if reply.T != "key" || reply.ID != 7 {
		t.Fatalf("unexpected reply %+v", reply)
	}

	servicePub, _ := base64.StdEncoding.DecodeString(reply.Pub)
	identPub, _ := base64.StdEncoding.DecodeString(reply.Ident)
	sig, _ := base64.StdEncoding.DecodeString(reply.Sig)

	transcript := append(append([]byte(e2eLabel), browserPub...), servicePub...)
	digest := sha256.Sum256(transcript)

	x, y := elliptic.Unmarshal(elliptic.P256(), identPub)
	if x == nil {
		t.Fatal("identity key is not on the curve")
	}

	verified := ecdsa.Verify(&ecdsa.PublicKey{Curve: elliptic.P256(), X: x, Y: y}, digest[:], new(big.Int).SetBytes(sig[:32]), new(big.Int).SetBytes(sig[32:]))
	if !verified {
		t.Fatal("signature does not verify")
	}

	remote, err := curve.NewPublicKey(servicePub)
	if err != nil {
		t.Fatal(err)
	}

	secret, err := priv.ECDH(remote)
	if err != nil {
		t.Fatal(err)
	}

	browser, err := newSession(secret, digest[:], true)
	if err != nil {
		t.Fatal(err)
	}

	fingerprint := "SHA256:" + base64.RawStdEncoding.EncodeToString(func() []byte { s := sha256.Sum256(identPub); return s[:] }())

	return browser, service, fingerprint
}

func newTestIdentity(t *testing.T) *identity {
	t.Helper()

	id, err := loadIdentity(filepath.Join(t.TempDir(), "terminal.key"))
	if err != nil {
		t.Fatal(err)
	}

	return id
}

func TestRoundTripBothDirections(t *testing.T) {
	id := newTestIdentity(t)
	browser, service, fingerprint := handshakeAsBrowser(t, id)

	if fingerprint != id.fingerprint() {
		t.Fatalf("fingerprints differ: %s vs %s", fingerprint, id.fingerprint())
	}

	for _, text := range []string{"ls -la\r", "", "žluťoučký kůň\r"} {
		plain, err := service.open(browser.seal([]byte(text)))
		if err != nil || string(plain) != text {
			t.Fatalf("keystrokes: %q %v", plain, err)
		}

		plain, err = browser.open(service.seal([]byte(text)))
		if err != nil || string(plain) != text {
			t.Fatalf("output: %q %v", plain, err)
		}
	}
}

func TestTamperedDroppedAndReplayedFramesFail(t *testing.T) {
	id := newTestIdentity(t)
	browser, service, _ := handshakeAsBrowser(t, id)

	first := browser.seal([]byte("one"))
	second := browser.seal([]byte("two"))

	// Reordered: the second frame arrives first.
	if _, err := service.open(second); err == nil {
		t.Fatal("a frame out of order must not decrypt")
	}

	if _, err := service.open(first); err != nil {
		t.Fatalf("the first frame still has to work after a rejected one: %v", err)
	}

	// Replayed.
	if _, err := service.open(first); err == nil {
		t.Fatal("a replayed frame must not decrypt")
	}

	// Flipped bit.
	third := browser.seal([]byte("three"))
	third[0] ^= 1

	if _, err := service.open(second); err != nil {
		t.Fatalf("second frame in order: %v", err)
	}

	if _, err := service.open(third); err == nil {
		t.Fatal("a modified frame must not decrypt")
	}
}

func TestEverySessionHasItsOwnKeys(t *testing.T) {
	id := newTestIdentity(t)
	browserA, _, _ := handshakeAsBrowser(t, id)
	_, serviceB, _ := handshakeAsBrowser(t, id)

	if _, err := serviceB.open(browserA.seal([]byte("secret"))); err == nil {
		t.Fatal("a frame from another session must not decrypt")
	}
}

func TestRejectsBadBrowserKeys(t *testing.T) {
	id := newTestIdentity(t)

	for _, input := range []string{"", "not base64!", base64.StdEncoding.EncodeToString([]byte("short")), base64.StdEncoding.EncodeToString(make([]byte, 65))} {
		if _, _, err := id.accept(1, input); err == nil {
			t.Fatalf("%q should be rejected", input)
		}
	}
}

func TestIdentityIsStoredPrivatelyAndStable(t *testing.T) {
	path := filepath.Join(t.TempDir(), "terminal.key")

	first, err := loadIdentity(path)
	if err != nil {
		t.Fatal(err)
	}

	info, err := os.Stat(path)
	if err != nil {
		t.Fatal(err)
	}

	if info.Mode().Perm() != 0o600 {
		t.Fatalf("the key file has mode %v, want 0600", info.Mode().Perm())
	}

	second, err := loadIdentity(path)
	if err != nil {
		t.Fatal(err)
	}

	if first.fingerprint() != second.fingerprint() || !strings.HasPrefix(first.fingerprint(), "SHA256:") {
		t.Fatalf("fingerprint changed: %s vs %s", first.fingerprint(), second.fingerprint())
	}
}

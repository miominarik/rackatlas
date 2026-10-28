<?php

namespace App\Services\Ssh;

use InvalidArgumentException;
use phpseclib4\Crypt\Common\PrivateKey;
use phpseclib4\Crypt\EC;
use phpseclib4\Crypt\PublicKeyLoader;
use Throwable;

class SshKeyService
{
    /**
     * Generate a new Ed25519 key pair.
     *
     * @return array{algorithm: string, fingerprint: string, public_key: string, private_key: string}
     */
    public function generate(string $comment): array
    {
        return $this->describe(EC::createKey('Ed25519'), $comment);
    }

    /**
     * Read an existing private key (OpenSSH, PEM or PuTTY format).
     *
     * @return array{algorithm: string, fingerprint: string, public_key: string, private_key: string}
     *
     * @throws InvalidArgumentException when the key or its passphrase is not valid
     */
    public function import(string $privateKey, ?string $passphrase, string $comment): array
    {
        try {
            $key = PublicKeyLoader::load(trim($privateKey)."\n", $passphrase ?: false);
        } catch (Throwable) {
            throw new InvalidArgumentException('The private key could not be read. Check the key and its passphrase.');
        }

        if (! $key instanceof PrivateKey) {
            throw new InvalidArgumentException('This is not a private key.');
        }

        return $this->describe($key, $comment, keepOriginal: trim($privateKey)."\n");
    }

    /**
     * @return array{algorithm: string, fingerprint: string, public_key: string, private_key: string}
     */
    private function describe(PrivateKey $key, string $comment, ?string $keepOriginal = null): array
    {
        $public = $key->getPublicKey();

        return [
            'algorithm' => $this->algorithm($key),
            'fingerprint' => 'SHA256:'.$public->getFingerprint('sha256'),
            'public_key' => $public->toString('OpenSSH', ['comment' => $comment]),
            'private_key' => $keepOriginal ?? $key->toString('OpenSSH'),
        ];
    }

    private function algorithm(PrivateKey $key): string
    {
        $family = basename(dirname(str_replace('\\', '/', $key::class)));

        return match ($family) {
            'EC' => $key->getCurve() === 'Ed25519' ? 'ed25519' : 'ecdsa',
            default => strtolower($family),
        };
    }
}

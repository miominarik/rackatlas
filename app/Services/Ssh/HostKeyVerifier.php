<?php

namespace App\Services\Ssh;

use App\Exceptions\HostKeyMismatchException;
use phpseclib4\Net\SSH2;
use RuntimeException;

/**
 * Pins the host key of a server (like known_hosts): the first connection stores its fingerprint
 * and every later one has to present the same key before any credential is sent.
 */
class HostKeyVerifier
{
    /** The SHA256 fingerprint of the host key the server presented, in the format of ssh-keygen. */
    public static function fingerprint(SSH2 $ssh): string
    {
        $hostKey = $ssh->getServerPublicHostKey();

        if ($hostKey === null) {
            throw new RuntimeException('The host key of the server could not be verified.');
        }

        return self::fingerprintOf($hostKey);
    }

    /** @param  string  $hostKey  "<format> <base64 key>" as returned by phpseclib */
    public static function fingerprintOf(string $hostKey): string
    {
        $blob = base64_decode(explode(' ', $hostKey, 2)[1] ?? '', true);

        if ($blob === false || $blob === '') {
            throw new RuntimeException('The host key of the server could not be read.');
        }

        return 'SHA256:'.rtrim(base64_encode(hash('sha256', $blob, true)), '=');
    }

    /**
     * @throws HostKeyMismatchException when a pinned fingerprint differs from the presented one
     */
    public static function assertTrusted(?string $pinned, string $actual): void
    {
        if ($pinned !== null && ! hash_equals($pinned, $actual)) {
            throw new HostKeyMismatchException(
                "The host key of the server has changed (expected {$pinned}, got {$actual}). "
                .'If the server was reinstalled, reset the stored host key in the server settings; otherwise someone may be impersonating it.'
            );
        }
    }
}

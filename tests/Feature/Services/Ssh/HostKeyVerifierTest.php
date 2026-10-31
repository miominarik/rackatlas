<?php

namespace Tests\Feature\Services\Ssh;

use App\Exceptions\HostKeyMismatchException;
use App\Services\Ssh\HostKeyVerifier;
use RuntimeException;
use Tests\TestCase;

class HostKeyVerifierTest extends TestCase
{
    public function test_fingerprint_matches_the_ssh_keygen_format(): void
    {
        $blob = 'host-key-bytes';
        $expected = 'SHA256:'.rtrim(base64_encode(hash('sha256', $blob, true)), '=');

        $this->assertSame($expected, HostKeyVerifier::fingerprintOf('ssh-ed25519 '.base64_encode($blob)));
    }

    public function test_unreadable_host_key_is_rejected(): void
    {
        $this->expectException(RuntimeException::class);

        HostKeyVerifier::fingerprintOf('ssh-ed25519 ');
    }

    public function test_first_connection_has_nothing_pinned_and_is_trusted(): void
    {
        HostKeyVerifier::assertTrusted(null, 'SHA256:abc');

        $this->addToAssertionCount(1);
    }

    public function test_the_same_key_is_trusted(): void
    {
        HostKeyVerifier::assertTrusted('SHA256:abc', 'SHA256:abc');

        $this->addToAssertionCount(1);
    }

    public function test_a_changed_key_is_refused(): void
    {
        $this->expectException(HostKeyMismatchException::class);

        HostKeyVerifier::assertTrusted('SHA256:abc', 'SHA256:other');
    }
}

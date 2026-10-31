<?php

namespace Tests\Feature\Services\Ssh;

use App\Services\Ssh\ConnectionTester;
use App\Services\Ssh\PublicHost;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class PublicHostTest extends TestCase
{
    #[TestWith(['127.0.0.1'])]
    #[TestWith(['10.1.2.3'])]
    #[TestWith(['192.168.1.1'])]
    #[TestWith(['169.254.169.254'])]
    #[TestWith(['100.64.0.1'])]
    #[TestWith(['0.0.0.0'])]
    #[TestWith(['224.0.0.1'])]
    #[TestWith(['[::1]'])]
    #[TestWith(['fc00::1'])]
    #[TestWith(['fe80::1'])]
    #[TestWith(['::ffff:127.0.0.1'])]
    #[TestWith(['64:ff9b::7f00:1'])]
    public function test_rejects_non_public_ssh_destinations(string $host): void
    {
        $this->expectException(InvalidArgumentException::class);

        PublicHost::resolve($host);
    }

    #[TestWith(['8.8.8.8', '8.8.8.8'])]
    #[TestWith(['2606:4700:4700::1111', '[2606:4700:4700::1111]'])]
    public function test_returns_checked_public_ip_for_connection(string $host, string $expected): void
    {
        $this->assertSame($expected, PublicHost::resolve($host));
    }

    public function test_connection_test_refuses_local_address_before_opening_socket(): void
    {
        $result = app(ConnectionTester::class)->test('127.0.0.1', 22, 'root', 'password', null);

        $this->assertFalse($result['success']);
    }
}

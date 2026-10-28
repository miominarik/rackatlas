<?php

namespace App\Services\Ssh;

use App\Models\SshKey;
use phpseclib4\Crypt\PublicKeyLoader;
use phpseclib4\Net\SSH2;
use Throwable;

class ConnectionTester
{
    private const TIMEOUT_SECONDS = 8;

    /**
     * Try to log in with a password or an SSH key.
     *
     * @return array{success: bool, message: string}
     */
    public function test(string $host, int $port, string $username, ?string $password, ?SshKey $key): array
    {
        try {
            $credential = $key
                ? PublicKeyLoader::load($key->private_key, $key->passphrase ?: false)
                : (string) $password;
        } catch (Throwable) {
            return $this->failure(__('The SSH key could not be used.'));
        }

        try {
            $ssh = new SSH2($host, $port, self::TIMEOUT_SECONDS);
            $ssh->setTimeout(self::TIMEOUT_SECONDS);

            $loggedIn = $ssh->login($username, $credential);
        } catch (Throwable) {
            return $this->failure(__('Could not connect to :host on port :port.', ['host' => $host, 'port' => $port]));
        }

        if (! $loggedIn) {
            return $this->failure($key
                ? __('The server rejected the SSH key. Add the public key to ~/.ssh/authorized_keys of this user.')
                : __('Authentication failed. Check the username and password.'));
        }

        $ssh->disconnect();

        return ['success' => true, 'message' => __('Connection successful.')];
    }

    /**
     * @return array{success: bool, message: string}
     */
    private function failure(string $message): array
    {
        return ['success' => false, 'message' => $message];
    }
}

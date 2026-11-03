<?php

namespace App\Services\Terminal;

use phpseclib4\Common\Functions\Strings;
use phpseclib4\Net\SSH2;
use phpseclib4\Net\SSH2\MessageType;

/**
 * An SSH connection with an interactive shell that can be polled for fractions of a second and
 * resized, which the stock client (whole second timeouts, fixed window size) does not offer.
 */
class TerminalSsh extends SSH2
{
    /**
     * Wait up to the given time for output of the shell.
     *
     * @return string|null the output ('' when nothing arrived), null once the shell has ended
     */
    public function pump(float $seconds): ?string
    {
        $this->curTimeout = $seconds;
        $this->is_timeout = false;

        $result = $this->get_channel_packet(self::CHANNEL_SHELL);

        if ($result === false) {
            return null;
        }

        return is_string($result) ? $result : '';
    }

    /**
     * Tell the server the window of the terminal changed.
     */
    public function resizeShell(int $columns, int $rows): void
    {
        $this->setWindowSize($columns, $rows);

        $this->send_binary_packet(Strings::packSSH2(
            'CNsbNNNN',
            MessageType::CHANNEL_REQUEST,
            $this->server_channels[self::CHANNEL_SHELL],
            'window-change',
            false,
            $columns,
            $rows,
            0,
            0,
        ));
    }
}

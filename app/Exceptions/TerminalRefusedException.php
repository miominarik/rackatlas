<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * A terminal session that cannot start for a reason the person can act on; the message is shown to them.
 */
class TerminalRefusedException extends RuntimeException {}

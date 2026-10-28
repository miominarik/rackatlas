<?php

namespace App\Exceptions;

use App\Enums\ServerErrorType;
use RuntimeException;

class MetricsCollectionException extends RuntimeException
{
    public function __construct(
        public readonly ServerErrorType $type,
        string $message,
    ) {
        parent::__construct($message);
    }
}

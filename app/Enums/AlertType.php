<?php

namespace App\Enums;

enum AlertType: string
{
    case Offline = 'offline';
    case Resource = 'resource';
    case Service = 'service';
    case Log = 'log';

    /**
     * The column of the notification preferences that switches this kind of alert on or off.
     */
    public function preference(): string
    {
        return match ($this) {
            self::Offline => 'notify_offline',
            self::Resource => 'notify_resources',
            self::Service => 'notify_services',
            self::Log => 'notify_logs',
        };
    }
}

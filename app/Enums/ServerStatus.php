<?php

namespace App\Enums;

enum ServerStatus: string
{
    case Unknown = 'unknown';
    case Online = 'online';
    case Offline = 'offline';
}

<?php

namespace App\Enums;

enum ServerErrorType: string
{
    case Connection = 'connection';
    case Authentication = 'authentication';
    case Key = 'key';
    case Command = 'command';
    case Parse = 'parse';
    case Silent = 'silent';
    case Unknown = 'unknown';
}

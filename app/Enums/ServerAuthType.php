<?php

namespace App\Enums;

enum ServerAuthType: string
{
    case Password = 'password';
    case Key = 'key';
}

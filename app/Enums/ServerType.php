<?php

namespace App\Enums;

enum ServerType: string
{
    /** A Linux machine, watched over SSH or by the agent. */
    case Server = 'server';
    case Mysql = 'mysql';
    case Redis = 'redis';
}

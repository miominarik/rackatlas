<?php

namespace App\Support;

use Illuminate\Http\Request;

/**
 * The Capacitor mobile shell (see /mobile) appends this token to the WebView user agent.
 */
class NativeApp
{
    public const USER_AGENT_TOKEN = 'RackAtlasApp';

    public static function isRequest(?Request $request = null): bool
    {
        $request ??= request();

        return str_contains((string) $request->userAgent(), self::USER_AGENT_TOKEN);
    }
}

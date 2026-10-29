<?php

namespace App\Support;

/**
 * Turns a User-Agent header into something a person recognises: "Chrome on Android".
 */
class DeviceDetector
{
    /**
     * @return array{browser: string, platform: string, type: 'mobile'|'tablet'|'desktop'}
     */
    public static function detect(?string $userAgent): array
    {
        $ua = (string) $userAgent;

        $browser = match (true) {
            str_contains($ua, 'Edg/'), str_contains($ua, 'EdgA/'), str_contains($ua, 'EdgiOS/') => 'Edge',
            str_contains($ua, 'OPR/'), str_contains($ua, 'Opera') => 'Opera',
            str_contains($ua, 'SamsungBrowser') => 'Samsung Internet',
            str_contains($ua, 'Firefox/'), str_contains($ua, 'FxiOS/') => 'Firefox',
            str_contains($ua, 'Chrome/'), str_contains($ua, 'CriOS/') => 'Chrome',
            str_contains($ua, 'Safari/') => 'Safari',
            default => __('Browser'),
        };

        $platform = match (true) {
            str_contains($ua, 'Android') => 'Android',
            str_contains($ua, 'iPhone'), str_contains($ua, 'iPad'), str_contains($ua, 'iPod') => 'iOS',
            str_contains($ua, 'CrOS') => 'ChromeOS',
            str_contains($ua, 'Windows') => 'Windows',
            str_contains($ua, 'Mac OS X'), str_contains($ua, 'Macintosh') => 'macOS',
            str_contains($ua, 'Linux') => 'Linux',
            default => '',
        };

        $type = match (true) {
            str_contains($ua, 'iPad'), str_contains($ua, 'Tablet'), (str_contains($ua, 'Android') && ! str_contains($ua, 'Mobile')) => 'tablet',
            str_contains($ua, 'Mobi'), str_contains($ua, 'iPhone'), str_contains($ua, 'iPod') => 'mobile',
            default => 'desktop',
        };

        return ['browser' => $browser, 'platform' => $platform, 'type' => $type];
    }
}

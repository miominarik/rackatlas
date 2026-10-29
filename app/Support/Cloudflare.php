<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Throwable;

class Cloudflare
{
    public const CACHE_KEY = 'cloudflare.ip-ranges';

    /**
     * Built-in list (https://www.cloudflare.com/ips/, checked 2026-10-29), used until the nightly
     * `cloudflare:refresh-ips` has stored a fresh one, and whenever the cache cannot be read.
     *
     * @var array<int, string>
     */
    public const RANGES = [
        '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18',
        '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17',
        '162.158.0.0/15', '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
        '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32', '2405:8100::/32',
        '2a06:98c0::/29', '2c0f:f248::/32',
    ];

    /** @var array<int, string>|null */
    private static ?array $memo = null;

    /**
     * Addresses Cloudflare connects from. Only requests from these addresses may tell us the visitor's
     * IP address and scheme, so nobody can fake them by calling the server directly.
     *
     * @return array<int, string>
     */
    public static function ranges(): array
    {
        if (self::$memo !== null) {
            return self::$memo;
        }

        try {
            $stored = Cache::get(self::CACHE_KEY);
        } catch (Throwable) {
            $stored = null;
        }

        return self::$memo = is_array($stored) && $stored !== [] ? $stored : self::RANGES;
    }

    public static function forget(): void
    {
        self::$memo = null;
    }

    public static function isRange(mixed $value): bool
    {
        if (! is_string($value) || substr_count($value, '/') !== 1) {
            return false;
        }

        [$address, $mask] = explode('/', $value);

        if (! ctype_digit($mask)) {
            return false;
        }

        if (filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false) {
            return (int) $mask <= 32;
        }

        return filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) !== false && (int) $mask <= 128;
    }
}

<?php

namespace App\Services\Ssh;

use InvalidArgumentException;
use Symfony\Component\HttpFoundation\IpUtils;

class PublicHost
{
    /** Resolve once and connect to the checked IP, not to a hostname that can change its DNS answer. */
    public static function resolve(string $host): string
    {
        $host = trim($host, '[]');
        $addresses = filter_var($host, FILTER_VALIDATE_IP) !== false
            ? [$host]
            : (gethostbynamel($host) ?: array_column(dns_get_record($host, DNS_AAAA) ?: [], 'ipv6'));

        if ($addresses === []) {
            throw new InvalidArgumentException('The SSH hostname could not be resolved.');
        }

        foreach ($addresses as $address) {
            if (filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_GLOBAL_RANGE) === false
                || IpUtils::isPrivateIp($address)
                || IpUtils::checkIp($address, ['224.0.0.0/4', 'ff00::/8'])) {
                throw new InvalidArgumentException('SSH connections require a public IP address.');
            }
        }

        $address = $addresses[0];

        return str_contains($address, ':') ? '['.$address.']' : $address;
    }
}

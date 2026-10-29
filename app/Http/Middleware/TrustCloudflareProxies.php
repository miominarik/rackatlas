<?php

namespace App\Http\Middleware;

use App\Support\Cloudflare;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Request;

/**
 * The site is behind Cloudflare: the visitor's address and the scheme are taken from the headers
 * of the requests that come from Cloudflare, and from no one else.
 */
class TrustCloudflareProxies extends TrustProxies
{
    protected $headers = Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO;

    /**
     * @return array<int, string>
     */
    protected function proxies()
    {
        return Cloudflare::ranges();
    }
}

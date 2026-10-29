<?php

namespace App\Console\Commands;

use App\Support\Cloudflare;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

#[Signature('cloudflare:refresh-ips')]
#[Description('Store the current IP ranges of Cloudflare, the only proxies the site trusts')]
class RefreshCloudflareIpsCommand extends Command
{
    private const API_URL = 'https://api.cloudflare.com/client/v4/ips';

    /** A list this short means the answer is not the real list; the old one is kept. */
    private const MIN_RANGES = 10;

    public function handle(): int
    {
        try {
            $result = Http::timeout(15)->retry(2, 1000)->acceptJson()->get(self::API_URL)->throw()->json('result');
        } catch (Throwable $e) {
            return $this->failure('Could not fetch the list: '.$e->getMessage());
        }

        $ranges = array_values(array_unique([
            ...(array) ($result['ipv4_cidrs'] ?? []),
            ...(array) ($result['ipv6_cidrs'] ?? []),
        ]));

        if (count($ranges) < self::MIN_RANGES || array_filter($ranges, fn ($range) => ! Cloudflare::isRange($range)) !== []) {
            return $this->failure('The answer of Cloudflare is not a valid list of ranges.');
        }

        $before = Cloudflare::ranges();
        Cache::forever(Cloudflare::CACHE_KEY, $ranges);
        Cloudflare::forget();

        $added = array_diff($ranges, $before);
        $removed = array_diff($before, $ranges);

        if ($added !== [] || $removed !== []) {
            Log::info('Cloudflare IP ranges changed.', ['added' => array_values($added), 'removed' => array_values($removed)]);
        }

        $this->info(count($ranges).' ranges stored ('.count($added).' added, '.count($removed).' removed).');

        return self::SUCCESS;
    }

    private function failure(string $message): int
    {
        Log::warning('Cloudflare IP ranges were not updated. '.$message);
        $this->error($message);

        return self::FAILURE;
    }
}

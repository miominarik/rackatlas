<?php

namespace App\Services\Storage;

use App\Models\StorageMonitor;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use SimpleXMLElement;
use Throwable;

/**
 * Lists a container of Azure Blob Storage with a SAS token and adds up the blobs. The same call
 * proves the account is reachable and the token still works.
 */
class AzureBlobChecker
{
    /** Blobs per request, the maximum Azure allows. */
    private const PAGE_SIZE = 5000;

    /** A bigger container is counted only up to this many pages, so a check stays short. */
    private const MAX_PAGES = 20;

    private const TIMEOUT_SECONDS = 15;

    /** Counting stops after this long and the result is shown as a lower bound, so a huge container never runs into the job timeout. */
    private const TIME_BUDGET_SECONDS = 45;

    /**
     * @return array{ok: bool, response_ms: int|null, blob_count: int|null, total_bytes: int|null, partial: bool, error: string|null}
     */
    public function check(StorageMonitor $monitor): array
    {
        $started = microtime(true);
        $count = 0;
        $bytes = 0;
        $marker = null;
        $pages = 0;

        try {
            do {
                $response = Http::timeout(self::TIMEOUT_SECONDS)
                    ->withUserAgent('RackAtlas')
                    ->get($this->url($monitor, $marker));

                if (! $response->successful()) {
                    return $this->failure($started, $this->describe($response->status(), $response->body()));
                }

                $xml = new SimpleXMLElement($response->body());

                foreach ($xml->Blobs->Blob ?? [] as $blob) {
                    $count++;
                    $bytes += (int) $blob->Properties->{'Content-Length'};
                }

                $marker = (string) ($xml->NextMarker ?? '');
                $pages++;
            } while ($marker !== '' && $pages < self::MAX_PAGES && microtime(true) - $started < self::TIME_BUDGET_SECONDS);
        } catch (ConnectionException) {
            return $this->failure($started, 'The storage account did not answer in time.');
        } catch (Throwable) {
            return $this->failure($started, 'The answer of the storage account could not be read.');
        }

        return [
            'ok' => true,
            'response_ms' => (int) round((microtime(true) - $started) * 1000),
            'blob_count' => $count,
            'total_bytes' => $bytes,
            'partial' => $marker !== '',
            'error' => null,
        ];
    }

    /**
     * The address of one page of the listing. The account and container are validated when
     * they are saved, so the host is always *.blob.core.windows.net.
     */
    private function url(StorageMonitor $monitor, ?string $marker): string
    {
        $query = 'restype=container&comp=list&maxresults='.self::PAGE_SIZE;

        if ($marker) {
            $query .= '&marker='.rawurlencode($marker);
        }

        return "https://{$monitor->account}.blob.core.windows.net/{$monitor->container}?{$query}&".ltrim($monitor->sas_token, '?&');
    }

    /**
     * @return array{ok: bool, response_ms: int|null, blob_count: int|null, total_bytes: int|null, partial: bool, error: string|null}
     */
    private function failure(float $started, string $error): array
    {
        return [
            'ok' => false,
            'response_ms' => (int) round((microtime(true) - $started) * 1000),
            'blob_count' => null,
            'total_bytes' => null,
            'partial' => false,
            'error' => $error,
        ];
    }

    /**
     * A short explanation of an error answer. The SAS token is never part of it.
     */
    private function describe(int $status, string $body): string
    {
        $code = preg_match('~<Code>([A-Za-z]+)</Code>~', $body, $match) ? $match[1] : null;

        return match (true) {
            $code === 'ContainerNotFound' => 'The container does not exist.',
            $code === 'AuthorizationPermissionMismatch' => 'The SAS token does not allow listing the container (it needs the Read and List permissions).',
            $code === 'AuthorizationFailure' => 'Azure refused the SAS token. Check the firewall and allowed IP addresses of the storage account, and that the token has not expired.',
            $status === 403 => 'The SAS token was refused. It may be expired or without the Read and List permissions.',
            $status === 404 => 'The storage account or the container was not found.',
            $status >= 500 => 'Azure Storage answered with an error ('.$status.').',
            default => 'Azure Storage refused the request ('.$status.($code ? ', '.$code : '').').',
        };
    }
}

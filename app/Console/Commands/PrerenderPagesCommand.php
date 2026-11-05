<?php

namespace App\Console\Commands;

use App\Http\Middleware\ServePrerenderedPage;
use App\Support\PrerenderedPages;
use Illuminate\Console\Command;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\Process\Process;

class PrerenderPagesCommand extends Command
{
    protected $signature = 'seo:prerender';

    protected $description = 'Render the public pages to HTML for search engines (run after npm run build:ssr)';

    public function handle(Kernel $kernel): int
    {
        if (! is_file(base_path('bootstrap/ssr/app.js')) && ! is_file(base_path('bootstrap/ssr/ssr.mjs'))) {
            $this->warn('No SSR bundle in bootstrap/ssr, run "npm run build:ssr" first. The pages are rendered in the browser.');

            return self::SUCCESS;
        }

        if (! PrerenderedPages::available()) {
            $this->warn('There is no build (public/build/manifest.json) or the Vite dev server is running. Nothing to prerender.');

            return self::SUCCESS;
        }

        // The requests below run in this process and must leave nothing in the live session store.
        config(['session.driver' => 'array']);

        $server = new Process([PHP_BINARY, 'artisan', 'inertia:start-ssr'], base_path());
        $server->setTimeout(null);
        $server->start();

        try {
            if (! $this->waitForServer($server)) {
                $this->warn('The SSR server did not start. The pages are rendered in the browser.');

                return self::SUCCESS;
            }

            $stored = 0;

            foreach (array_keys(config('app.supported_locales')) as $locale) {
                foreach (PrerenderedPages::routes() as $routeName => $suffix) {
                    $stored += $this->render($kernel, $routeName, $locale, "/{$locale}{$suffix}") ? 1 : 0;
                }
            }

            PrerenderedPages::prune();
            $this->info("Prerendered {$stored} pages.");

            return self::SUCCESS;
        } finally {
            $server->stop(3);
        }
    }

    private function render(Kernel $kernel, string $routeName, string $locale, string $path): bool
    {
        $request = Request::create($path, 'GET', server: ['HTTP_HOST' => parse_url(config('app.url'), PHP_URL_HOST), 'HTTPS' => 'on']);
        $request->headers->set(ServePrerenderedPage::HEADER, '1');

        $response = $kernel->handle($request);
        $html = (string) $response->getContent();

        if ($response->getStatusCode() !== 200 || ! str_contains($html, 'data-server-rendered="true"')) {
            $this->warn("Skipped {$path}: it was not rendered on the server.");

            return false;
        }

        PrerenderedPages::store($routeName, $locale, $html);

        return true;
    }

    private function waitForServer(Process $server): bool
    {
        $url = rtrim((string) config('inertia.ssr.url'), '/').'/health';

        for ($attempt = 0; $attempt < 30 && $server->isRunning(); $attempt++) {
            try {
                if (Http::timeout(1)->get($url)->successful()) {
                    return true;
                }
            } catch (\Throwable) {
                // Not listening yet.
            }

            usleep(500_000);
        }

        return false;
    }
}

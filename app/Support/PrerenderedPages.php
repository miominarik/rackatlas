<?php

namespace App\Support;

use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Vite;

/**
 * Public pages rendered once at build time and kept as finished HTML, so search engines get the
 * full content without a Node server running next to the app. A build changes the assets, so the
 * files of an older build are never served.
 */
class PrerenderedPages
{
    public const DIRECTORY = 'prerender';

    /** The routes without a language in the URL and the localized route whose page they show. */
    public const LOCALIZED_ROUTES = ['home' => 'home.localized', 'privacy' => 'privacy.localized'];

    /**
     * The public pages by the name of their localized route.
     *
     * @return array<string, string> Route name => path inside the locale, `''` for the home page.
     */
    public static function routes(): array
    {
        return ['home.localized' => '', 'privacy.localized' => '/privacy'];
    }

    public static function key(string $routeName, string $locale): string
    {
        return sprintf('%s-%s', $locale, $routeName);
    }

    /**
     * Whether there is a build the pages can be tied to. A running dev server has none.
     */
    public static function available(): bool
    {
        return Vite::manifestHash() !== null;
    }

    public static function find(string $routeName, string $locale): ?string
    {
        if (! self::available()) {
            return null;
        }

        $path = self::path($routeName, $locale);

        return self::disk()->exists($path) ? self::disk()->get($path) : null;
    }

    public static function store(string $routeName, string $locale, string $html): void
    {
        self::disk()->put(self::path($routeName, $locale), $html);
    }

    /**
     * Remove what earlier builds left behind.
     */
    public static function prune(): void
    {
        foreach (self::disk()->directories(self::DIRECTORY) as $directory) {
            if (basename($directory) !== self::build()) {
                self::disk()->deleteDirectory($directory);
            }
        }
    }

    private static function path(string $routeName, string $locale): string
    {
        return sprintf('%s/%s/%s.html', self::DIRECTORY, self::build(), self::key($routeName, $locale));
    }

    private static function build(): string
    {
        return substr((string) Vite::manifestHash(), 0, 16);
    }

    private static function disk(): Filesystem
    {
        return Storage::disk('local');
    }
}

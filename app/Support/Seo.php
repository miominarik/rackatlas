<?php

namespace App\Support;

/**
 * Search and social metadata for the public pages. It is rendered by the server into the first HTML
 * response (see resources/views/partials/seo.blade.php) so crawlers and link previews that do not run
 * JavaScript still see it.
 */
final class Seo
{
    private const OG_LOCALES = ['sk' => 'sk_SK', 'cs' => 'cs_CZ', 'en' => 'en_US'];

    /**
     * @param  string  $routeName  'home' or 'privacy': the route without a language, its '.localized' twin has one
     * @param  list<array<string, mixed>>  $schema  JSON-LD nodes
     * @param  list<array{label: string, url: string}>  $links  plain links for visitors without JavaScript
     * @return array<string, mixed>
     */
    public static function page(string $title, string $description, string $routeName, array $schema = [], array $links = []): array
    {
        $locale = app()->getLocale();
        $canonical = route($routeName.'.localized', ['locale' => $locale]);

        $alternates = [];
        foreach (array_keys(config('app.supported_locales')) as $code) {
            $alternates[$code] = route($routeName.'.localized', ['locale' => $code]);
        }
        $alternates['x-default'] = route($routeName);

        return [
            'title' => $title.' - '.config('app.name'),
            'heading' => $title,
            'description' => $description,
            'url' => $canonical,
            'alternates' => $alternates,
            'image' => url('og-image.png'),
            'imageAlt' => __('RackAtlas: Linux server monitoring without open ports'),
            'locale' => self::OG_LOCALES[$locale] ?? 'en_US',
            'alternateLocales' => array_values(array_diff(self::OG_LOCALES, [self::OG_LOCALES[$locale] ?? 'en_US'])),
            'schema' => $schema,
            'links' => $links,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function organization(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            '@id' => url('/').'#organization',
            'name' => 'RackAtlas',
            'url' => url('/'),
            'logo' => url('icons/icon-512.png'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public static function website(): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'WebSite',
            '@id' => url('/').'#website',
            'name' => 'RackAtlas',
            'url' => url('/'),
            'inLanguage' => app()->getLocale(),
            'publisher' => ['@id' => url('/').'#organization'],
        ];
    }

    /**
     * @param  list<array{string, string}>  $faq  pairs of question and answer
     * @return array<string, mixed>
     */
    public static function faqPage(array $faq): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => array_map(fn (array $pair) => [
                '@type' => 'Question',
                'name' => $pair[0],
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $pair[1]],
            ], $faq),
        ];
    }

    /**
     * @param  list<array{string, string}>  $crumbs  pairs of name and url
     * @return array<string, mixed>
     */
    public static function breadcrumbs(array $crumbs): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => array_map(fn (array $crumb, int $index) => [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $crumb[0],
                'item' => $crumb[1],
            ], $crumbs, array_keys($crumbs)),
        ];
    }
}

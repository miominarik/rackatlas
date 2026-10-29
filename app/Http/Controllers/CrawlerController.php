<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class CrawlerController extends Controller
{
    /**
     * robots.txt: the app and the API are not for crawlers, the public pages are.
     */
    public function robots(): Response
    {
        $lines = [
            'User-agent: *',
            'Allow: /',
            'Disallow: /app/',
            'Disallow: /api/',
            '',
            'Sitemap: '.route('sitemap'),
        ];

        return response(implode("\n", $lines)."\n", 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    /**
     * sitemap.xml with the public pages only. Their last modification is the date of the latest build.
     */
    public function sitemap(): Response
    {
        $manifest = public_path('build/manifest.json');
        $built = date('Y-m-d', is_file($manifest) ? filemtime($manifest) : time());

        $pages = [['home', $built], ['privacy', config('legal.updated_at')]];
        $codes = array_keys(config('app.supported_locales'));

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'."\n";

        foreach ($pages as [$route, $lastmod]) {
            foreach ($codes as $code) {
                $xml .= '    <url><loc>'.e(route($route.'.localized', ['locale' => $code])).'</loc><lastmod>'.$lastmod.'</lastmod>';

                foreach ($codes as $alternate) {
                    $xml .= '<xhtml:link rel="alternate" hreflang="'.$alternate.'" href="'.e(route($route.'.localized', ['locale' => $alternate])).'"/>';
                }

                $xml .= '<xhtml:link rel="alternate" hreflang="x-default" href="'.e(route($route)).'"/></url>'."\n";
            }
        }

        return response($xml.'</urlset>'."\n", 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}

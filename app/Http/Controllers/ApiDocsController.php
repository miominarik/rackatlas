<?php

namespace App\Http\Controllers;

use App\Models\ApiToken;
use App\Services\Api\MetricSeries;
use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

class ApiDocsController extends Controller
{
    /**
     * The public developer documentation of the external API. English only, as developer docs usually are.
     */
    public function __invoke(): Response
    {
        $title = 'API documentation';

        return Inertia::render('api-docs', [
            'baseUrl' => url('/api/v1'),
            'scopes' => ApiToken::SCOPES,
            'intervals' => MetricSeries::INTERVALS,
            'maxRangeDays' => MetricSeries::MAX_RANGE_DAYS,
            'maxPoints' => MetricSeries::MAX_POINTS,
            'seo' => Seo::standalone(
                $title,
                'Read-only JSON API of RackAtlas: servers, metrics history, services, backups and alerts. Authentication with team keys, scopes, examples and a Grafana setup.',
                'api-docs',
                [
                    Seo::organization(),
                    Seo::breadcrumbs([['Home', route('home')], [$title, route('api-docs')]]),
                ],
                [['label' => 'Home', 'url' => route('home')]],
            ),
        ]);
    }
}

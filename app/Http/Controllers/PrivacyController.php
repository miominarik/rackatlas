<?php

namespace App\Http\Controllers;

use App\Support\Seo;
use Inertia\Inertia;
use Inertia\Response;

class PrivacyController extends Controller
{
    /**
     * The public privacy and cookie policy.
     */
    public function __invoke(): Response
    {
        $title = __('Privacy and cookies');

        return Inertia::render('privacy', [
            'operator' => array_filter(config('legal.operator')),
            'updatedAt' => config('legal.updated_at'),
            'seo' => Seo::page(
                $title,
                __('What personal data RackAtlas processes, why, who receives it and which cookies the site uses.'),
                'privacy',
                [
                    Seo::organization(),
                    Seo::breadcrumbs([[__('Home'), route('home')], [$title, route('privacy')]]),
                ],
                [['label' => __('Home'), 'url' => route('home')]],
            ),
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PrivacyController extends Controller
{
    /**
     * The public privacy and cookie policy.
     */
    public function __invoke(): Response
    {
        return Inertia::render('privacy', [
            'operator' => array_filter(config('legal.operator')),
            'updatedAt' => config('legal.updated_at'),
        ]);
    }
}

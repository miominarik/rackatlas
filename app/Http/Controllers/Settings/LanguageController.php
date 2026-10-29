<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Middleware\SetLocale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LanguageController extends Controller
{
    /**
     * Show the language settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/language');
    }

    /**
     * Remember the language the user picked.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', Rule::in(array_keys(config('app.supported_locales')))],
        ]);

        Cookie::queue(Cookie::forever(SetLocale::COOKIE, $validated['locale']));

        app()->setLocale($validated['locale']);

        $request->user()?->forceFill(['locale' => $validated['locale']])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Language updated.')]);

        return to_route('language.edit');
    }
}

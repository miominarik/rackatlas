<?php

namespace App\Http\Middleware;

use App\Http\Controllers\CurrentTeamController;
use App\Services\TurnstileVerifier;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $teams = $request->user()
            ? $request->user()->teams()->orderBy('name')->get()->map(fn ($team) => [
                'id' => $team->id,
                'name' => $team->name,
                'role' => $team->pivot->role,
            ])
            : collect();

        $currentTeamId = $request->session()->get(CurrentTeamController::SESSION_KEY);
        $currentTeam = $teams->firstWhere('id', $currentTeamId) ?? $teams->first();

        return [
            ...parent::share($request),
            'teams' => $teams->values(),
            'currentTeam' => $currentTeam,
            'name' => config('app.name'),
            'turnstile' => [
                'siteKey' => app(TurnstileVerifier::class)->enabled() ? config('services.turnstile.site_key') : null,
            ],
            'locale' => app()->getLocale(),
            'locales' => config('app.supported_locales'),
            'translations' => $this->translations(),
            'auth' => [
                'user' => $request->user(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }

    /**
     * The JSON translation lines of the active locale for the React side.
     *
     * @return array<string, string>|object
     */
    private function translations(): array|object
    {
        $path = lang_path(app()->getLocale().'.json');

        if (! is_file($path)) {
            return (object) [];
        }

        $lines = json_decode((string) file_get_contents($path), true) ?: [];

        // Validation, auth and password messages are only needed on the server.
        return array_filter(
            $lines,
            fn (string $key) => ! preg_match('/^(validation|auth|passwords)\./', $key),
            ARRAY_FILTER_USE_KEY,
        ) ?: (object) [];
    }
}

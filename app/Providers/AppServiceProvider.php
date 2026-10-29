<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureAgentRateLimiting();
        $this->configureWebRateLimiting();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * An agent reports once a minute (with up to two retries). The address limit leaves room for many
     * servers behind one address and runs before the token is looked up. The limits per wrong token and
     * per server (after the token was accepted) are in the AuthenticateAgent middleware.
     */
    protected function configureAgentRateLimiting(): void
    {
        RateLimiter::for('agent', fn (Request $request) => Limit::perMinute(300)->by('agent-ip|'.$request->ip()));
    }

    /**
     * A ceiling for every page and form of the website. The routes with a sensitive action (login,
     * password, keys) have stricter limits of their own. Writes are limited more than reads.
     */
    protected function configureWebRateLimiting(): void
    {
        RateLimiter::for('web', function (Request $request) {
            $user = $request->user();
            $key = $user ? 'user|'.$user->getAuthIdentifier() : 'ip|'.$request->ip();
            $write = ! $request->isMethodSafe();

            return Limit::perMinute($user ? ($write ? 120 : 300) : ($write ? 30 : 120))
                ->by('web-'.($write ? 'write' : 'read').'|'.$key);
        });
    }
}

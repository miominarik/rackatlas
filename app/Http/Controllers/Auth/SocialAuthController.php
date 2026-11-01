<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use App\Support\SocialProviders;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Laravel\Socialite\Contracts\User as SocialUser;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

/**
 * Sign in, registration and linking of an account through an external provider (Microsoft).
 */
class SocialAuthController extends Controller
{
    private const LINK_SESSION_KEY = 'social_link_user_id';

    /**
     * Send the browser to the provider. A signed in user is linking an account, a guest is signing in.
     */
    public function redirect(Request $request, string $provider): RedirectResponse
    {
        abort_unless(SocialProviders::isEnabled($provider), 404);

        if ($request->user() !== null) {
            $request->session()->put(self::LINK_SESSION_KEY, $request->user()->id);
        } else {
            $request->session()->forget(self::LINK_SESSION_KEY);
        }

        return $this->driver($provider)->redirect();
    }

    /**
     * The provider sent the person back.
     */
    public function callback(Request $request, string $provider): RedirectResponse
    {
        abort_unless(SocialProviders::isEnabled($provider), 404);

        $linkUserId = $request->session()->pull(self::LINK_SESSION_KEY);
        $linking = $linkUserId !== null && (int) $linkUserId === $request->user()?->id;

        try {
            $social = $this->driver($provider)->user();
        } catch (Throwable $exception) {
            report($exception);

            return $this->fail($linking, __('Sign in with :provider was cancelled or failed. Please try again.', ['provider' => SocialProviders::NAMES[$provider]]));
        }

        if (blank($social->getId())) {
            return $this->fail($linking, __('Sign in with :provider was cancelled or failed. Please try again.', ['provider' => SocialProviders::NAMES[$provider]]));
        }

        $existing = SocialAccount::where('provider', $provider)->where('provider_id', $social->getId())->first();

        if ($linking) {
            return $this->link($request->user(), $provider, $social, $existing);
        }

        if ($existing !== null) {
            return $this->signIn($request, $existing->user);
        }

        return $this->register($request, $provider, $social);
    }

    private function link(User $user, string $provider, SocialUser $social, ?SocialAccount $existing): RedirectResponse
    {
        if ($existing !== null && $existing->user_id !== $user->id) {
            return $this->fail(true, __('This :provider account is already connected to another user.', ['provider' => SocialProviders::NAMES[$provider]]));
        }

        $user->socialAccounts()->updateOrCreate(
            ['provider' => $provider],
            ['provider_id' => $social->getId(), 'email' => $social->getEmail()],
        );

        activity('auth')->event('social-linked')->causedBy($user)->performedOn($user)
            ->withProperties(['provider' => $provider, 'ip' => request()->ip()])->log('social-linked');

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':provider account connected.', ['provider' => SocialProviders::NAMES[$provider]])]);

        return to_route('profile.edit');
    }

    /**
     * A person we have not seen. An existing account with the same email is never taken over:
     * the email from a provider is not always verified, so it has to be linked from the settings.
     */
    private function register(Request $request, string $provider, SocialUser $social): RedirectResponse
    {
        $email = (string) $social->getEmail();

        if (blank($email)) {
            return $this->fail(false, __('The :provider account did not share an email address, so we cannot create an account from it.', ['provider' => SocialProviders::NAMES[$provider]]));
        }

        if (User::where('email', $email)->exists()) {
            return $this->fail(false, __('An account with the email :email already exists. Sign in with your password and connect :provider in the settings.', ['email' => $email, 'provider' => SocialProviders::NAMES[$provider]]));
        }

        $user = User::create([
            'name' => $social->getName() ?: Str::before($email, '@'),
            'email' => $email,
            'password' => Str::random(48),
        ]);

        $user->socialAccounts()->create(['provider' => $provider, 'provider_id' => $social->getId(), 'email' => $email]);

        activity('auth')->event('social-registered')->causedBy($user)->performedOn($user)
            ->withProperties(['provider' => $provider, 'ip' => $request->ip()])->log('social-registered');

        // The address is verified by email like in a normal registration.
        event(new Registered($user));

        return $this->signIn($request, $user);
    }

    private function signIn(Request $request, User $user): RedirectResponse
    {
        if ($user->hasEnabledTwoFactorAuthentication()) {
            $request->session()->put(['login.id' => $user->getKey(), 'login.remember' => false]);

            return to_route('two-factor.login');
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    private function fail(bool $linking, string $message): RedirectResponse
    {
        if ($linking) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $message]);

            return to_route('profile.edit');
        }

        return to_route('login')->withErrors(['email' => $message]);
    }

    /**
     * The provider driver with the callback URL of this app.
     */
    private function driver(string $provider): mixed
    {
        return Socialite::driver($provider)->redirectUrl(route('social.callback', $provider));
    }
}

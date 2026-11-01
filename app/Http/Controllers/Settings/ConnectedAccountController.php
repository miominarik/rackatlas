<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Support\SocialProviders;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConnectedAccountController extends Controller
{
    /**
     * Disconnect an external account. The user can still sign in with the password, which can be
     * set again with "Forgot your password?".
     */
    public function destroy(Request $request, string $provider): RedirectResponse
    {
        $deleted = $request->user()->socialAccounts()->where('provider', $provider)->delete();

        if ($deleted > 0) {
            activity('auth')->event('social-unlinked')->causedBy($request->user())->performedOn($request->user())
                ->withProperties(['provider' => $provider, 'ip' => $request->ip()])->log('social-unlinked');
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':provider account disconnected.', ['provider' => SocialProviders::NAMES[$provider]])]);

        return back();
    }
}

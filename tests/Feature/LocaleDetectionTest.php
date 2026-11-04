<?php

namespace Tests\Feature;

use App\Http\Middleware\SetLocale;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class LocaleDetectionTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_a_new_visitor_gets_the_language_of_the_browser(): void
    {
        $this->withHeader('Accept-Language', 'cs-CZ,cs;q=0.9,en;q=0.5')->get(route('home'));

        $this->assertSame('cs', app()->getLocale());
    }

    public function test_the_first_supported_language_of_the_browser_wins(): void
    {
        $this->withHeader('Accept-Language', 'de-DE,de;q=0.9,sk;q=0.8')->get(route('home'));

        $this->assertSame('sk', app()->getLocale());
    }

    public function test_an_unsupported_browser_language_keeps_the_default(): void
    {
        $this->withHeader('Accept-Language', 'de-DE,fr;q=0.8')->get(route('home'));

        $this->assertSame(config('app.locale'), app()->getLocale());
    }

    public function test_the_cookie_beats_the_browser(): void
    {
        $this->withCookie(SetLocale::COOKIE, 'sk')
            ->withHeader('Accept-Language', 'cs')
            ->get(route('home'));

        $this->assertSame('sk', app()->getLocale());
    }

    public function test_the_language_of_the_account_beats_cookie_and_browser(): void
    {
        $user = User::factory()->create(['locale' => 'cs']);

        $this->actingAs($user)
            ->withCookie(SetLocale::COOKIE, 'sk')
            ->withHeader('Accept-Language', 'en')
            ->get(route('dashboard'));

        $this->assertSame('cs', app()->getLocale());
    }

    public function test_the_language_of_the_url_beats_everything(): void
    {
        $user = User::factory()->create(['locale' => 'cs']);

        $this->actingAs($user)
            ->withHeader('Accept-Language', 'sk')
            ->get(route('home.localized', 'en'));

        $this->assertSame('en', app()->getLocale());
    }
}

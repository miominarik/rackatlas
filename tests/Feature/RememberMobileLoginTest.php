<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class RememberMobileLoginTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.turnstile.secret_key' => null, 'services.turnstile.site_key' => null]);
    }

    private function signIn(array $headers): TestResponse
    {
        $user = User::factory()->create();

        return $this->withHeaders($headers)->post(route('login.store'), ['email' => $user->email, 'password' => 'password']);
    }

    private function remembered(TestResponse $response): bool
    {
        return $response->getCookie(Auth::guard('web')->getRecallerName(), false) !== null;
    }

    public function test_a_phone_is_remembered_without_ticking_anything(): void
    {
        $response = $this->signIn(['User-Agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile/15E148']);

        $this->assertTrue($this->remembered($response));
    }

    public function test_the_browser_hint_counts_even_with_a_desktop_user_agent(): void
    {
        $response = $this->signIn([
            'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15',
            'Sec-CH-UA-Mobile' => '?1',
        ]);

        $this->assertTrue($this->remembered($response));
    }

    public function test_a_computer_is_not_remembered_unless_asked(): void
    {
        $response = $this->signIn(['User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36', 'Sec-CH-UA-Mobile' => '?0']);

        $this->assertFalse($this->remembered($response));
    }
}

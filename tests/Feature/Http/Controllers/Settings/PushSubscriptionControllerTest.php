<?php

namespace Tests\Feature\Http\Controllers\Settings;

use App\Models\User;
use App\Notifications\Channels\WebPushChannel;
use App\Notifications\TestNotification;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\TestWith;
use Tests\TestCase;

class PushSubscriptionControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    #[TestWith(['https://127.0.0.1/private'])]
    #[TestWith(['https://[::1]/private'])]
    #[TestWith(['https://169.254.169.254/private'])]
    #[TestWith(['https://fcm.googleapis.com.evil.example/push'])]
    #[TestWith(['https://fcm.googleapis.com@evil.example/push'])]
    #[TestWith(['https://fcm.googleapis.com:8443/push'])]
    #[TestWith(['https://fcm.googleapis.com/push#fragment'])]
    public function test_rejects_untrusted_push_endpoints_with_422(string $endpoint): void
    {
        $this->actingAs(User::factory()->create())->postJson(route('push-subscriptions.store'), [
            'endpoint' => $endpoint, 'keys' => ['p256dh' => 'key', 'auth' => 'secret'],
        ])->assertUnprocessable()->assertJsonValidationErrors('endpoint');

        $this->assertDatabaseCount('push_subscriptions', 0);
    }

    #[TestWith(['https://fcm.googleapis.com/fcm/send/example'])]
    #[TestWith(['https://updates.push.services.mozilla.com/wpush/v2/example'])]
    #[TestWith(['https://web.push.apple.com/example'])]
    #[TestWith(['https://wns2.notify.windows.com/example'])]
    public function test_accepts_supported_push_providers_with_201(string $endpoint): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson(route('push-subscriptions.store'), [
            'endpoint' => $endpoint, 'keys' => ['p256dh' => 'key', 'auth' => 'secret'],
        ])->assertCreated();

        $this->assertSame($endpoint, $user->pushSubscriptions()->sole()->endpoint);
    }

    public function test_existing_untrusted_subscriptions_are_never_contacted(): void
    {
        $user = User::factory()->create();
        $user->pushSubscriptions()->create([
            'endpoint' => 'https://127.0.0.1/private', 'endpoint_hash' => hash('sha256', 'legacy'),
            'public_key' => 'key', 'auth_token' => 'secret', 'content_encoding' => 'aes128gcm',
        ]);
        config(['services.webpush.public_key' => 'configured', 'services.webpush.private_key' => 'configured']);
        Http::preventStrayRequests();
        Http::fake(['https://fcm.googleapis.com/' => Http::response('', 200)]);

        $this->actingAs($user)->postJson(route('notification-diagnostics.connectivity'))
            ->assertOk()->assertJsonPath('results.0.host', 'fcm.googleapis.com');
        Http::assertSentCount(1);
        $this->assertSame([], app(WebPushChannel::class)->push($user, new TestNotification));
    }
}

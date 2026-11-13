<?php

namespace Tests\Feature;

use App\Models\FcmToken;
use App\Models\User;
use App\Notifications\Channels\FcmChannel;
use App\Notifications\TestNotification;
use App\Support\NativeApp;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class FcmPushTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.fcm.credentials_json' => null, 'services.fcm.credentials_path' => null]);
    }

    private function configureFirebase(): void
    {
        openssl_pkey_export(openssl_pkey_new(['private_key_bits' => 2048]), $privateKey);

        config(['services.fcm.credentials_json' => json_encode([
            'project_id' => 'rackatlas-test',
            'client_email' => 'push@rackatlas-test.iam.gserviceaccount.com',
            'private_key' => $privateKey,
        ])]);

        Cache::forget('fcm.access-token');
    }

    private function appAgent(): string
    {
        return 'Mozilla/5.0 (Linux; Android 15; wv) '.NativeApp::USER_AGENT_TOKEN;
    }

    public function test_only_the_app_can_register_a_firebase_token(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson(route('fcm-tokens.store'), ['token' => 'abc'])->assertForbidden();
    }

    public function test_the_app_registers_its_token_and_it_moves_with_the_phone(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->withHeader('User-Agent', $this->appAgent())
            ->postJson(route('fcm-tokens.store'), ['token' => 'token-one', 'name' => 'Pixel'])
            ->assertCreated();
        $this->actingAs($user)->withHeader('User-Agent', $this->appAgent())
            ->postJson(route('fcm-tokens.store'), ['token' => 'token-one', 'name' => 'Pixel'])
            ->assertCreated();

        $this->assertSame(1, FcmToken::count());
        $this->assertSame($user->id, FcmToken::first()->user_id);
        $this->assertSame('token-one', FcmToken::first()->token);
    }

    public function test_a_critical_alert_goes_out_with_high_priority_on_the_alerts_channel(): void
    {
        $this->configureFirebase();
        Http::fake([
            'oauth2.googleapis.com/*' => Http::response(['access_token' => 'access-123']),
            'fcm.googleapis.com/*' => Http::response(['name' => 'projects/rackatlas-test/messages/1']),
        ]);

        $user = User::factory()->create();
        FcmToken::factory()->for($user)->create(['token' => 'phone-token', 'token_hash' => FcmToken::hashToken('phone-token')]);

        $results = app(FcmChannel::class)->push($user, new TestNotification);

        $this->assertTrue($results[0]['ok']);
        Http::assertSent(function (Request $request): bool {
            if (! str_contains($request->url(), 'rackatlas-test/messages:send')) {
                return false;
            }

            $message = $request['message'];

            return $request->hasHeader('Authorization', 'Bearer access-123')
                && $message['token'] === 'phone-token'
                && $message['android']['priority'] === 'HIGH'
                && $message['android']['notification']['channel_id'] === 'alerts';
        });
    }

    public function test_a_token_firebase_no_longer_knows_is_removed(): void
    {
        $this->configureFirebase();
        Http::fake([
            'oauth2.googleapis.com/*' => Http::response(['access_token' => 'access-123']),
            'fcm.googleapis.com/*' => Http::response(['error' => ['status' => 'NOT_FOUND', 'message' => 'Requested entity was not found.', 'details' => [['errorCode' => 'UNREGISTERED']]]], 404),
        ]);

        $user = User::factory()->create();
        FcmToken::factory()->for($user)->create();

        app(FcmChannel::class)->push($user, new TestNotification);

        $this->assertSame(0, FcmToken::count());
    }

    public function test_the_phone_is_a_notification_channel_only_when_firebase_is_configured(): void
    {
        $user = User::factory()->create();
        FcmToken::factory()->for($user)->create();

        $this->assertNotContains(FcmChannel::class, (new TestNotification)->via($user));

        $this->configureFirebase();

        $this->assertContains(FcmChannel::class, (new TestNotification)->via($user));
    }

    public function test_the_credentials_file_can_be_given_relative_to_the_project(): void
    {
        $this->configureFirebase();
        $json = config('services.fcm.credentials_json');
        $relative = 'storage/framework/testing/firebase-test.json';
        @mkdir(base_path('storage/framework/testing'), 0777, true);
        file_put_contents(base_path($relative), $json);
        config(['services.fcm.credentials_json' => null, 'services.fcm.credentials_path' => '/'.$relative]);

        $this->assertTrue(FcmChannel::configured());

        unlink(base_path($relative));
    }
}

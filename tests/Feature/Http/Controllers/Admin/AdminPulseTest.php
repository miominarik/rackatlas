<?php

namespace Tests\Feature\Http\Controllers\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class AdminPulseTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_pulse_is_only_for_administrators(): void
    {
        $this->get('/app/admin/pulse')->assertRedirect(route('login'));

        $this->actingAs(User::factory()->create())->get('/app/admin/pulse')->assertForbidden();

        $this->actingAs(User::factory()->admin()->create())->get('/app/admin/pulse')->assertOk();
    }

    public function test_collections_survive_the_cache_like_pulse_needs(): void
    {
        Cache::put('pulse-probe', collect([(object) ['a' => 1]]), 60);

        $this->assertInstanceOf(Collection::class, Cache::get('pulse-probe'));
        $this->assertSame(1, Cache::get('pulse-probe')->first()->a);
    }
}

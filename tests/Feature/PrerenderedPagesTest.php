<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\PrerenderedPages;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\ViewErrorBag;
use Tests\TestCase;

class PrerenderedPagesTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (! PrerenderedPages::available()) {
            $this->markTestSkipped('There is no frontend build to tie the prerendered pages to.');
        }

        Storage::fake('local');
        PrerenderedPages::store('home.localized', 'sk', '<html>PRERENDERED</html>');
    }

    public function test_guest_gets_the_prerendered_page(): void
    {
        $this->get('/sk')->assertOk()->assertSee('PRERENDERED', false);
    }

    public function test_page_without_a_language_in_the_url_gets_the_recognized_language(): void
    {
        $this->get('/', ['Accept-Language' => 'sk-SK,sk;q=0.9'])->assertSee('PRERENDERED', false);
        $this->get('/', ['Accept-Language' => 'cs'])->assertDontSee('PRERENDERED', false);
    }

    public function test_other_language_and_page_without_a_file_are_rendered_live(): void
    {
        $this->get('/cs')->assertOk()->assertDontSee('PRERENDERED', false);
        $this->get('/sk/privacy')->assertOk()->assertDontSee('PRERENDERED', false);
    }

    public function test_signed_in_user_gets_the_live_page(): void
    {
        $this->actingAs(User::factory()->create())->get('/sk')->assertOk()->assertDontSee('PRERENDERED', false);
    }

    public function test_inertia_visit_gets_json(): void
    {
        $this->get('/sk', ['X-Inertia' => 'true', 'X-Inertia-Version' => 'x'])->assertDontSee('PRERENDERED', false);
    }

    public function test_page_with_validation_errors_is_rendered_live(): void
    {
        $this->withSession(['errors' => new ViewErrorBag])->get('/sk')->assertDontSee('PRERENDERED', false);

        $this->withSession(['_flash' => ['old' => ['inertia.flash_data'], 'new' => []]])->get('/sk')
            ->assertDontSee('PRERENDERED', false);
    }

    public function test_pages_of_an_older_build_are_pruned(): void
    {
        Storage::disk('local')->put('prerender/oldbuild/sk-home.localized.html', 'old');

        PrerenderedPages::prune();

        Storage::disk('local')->assertMissing('prerender/oldbuild/sk-home.localized.html');
        $this->assertNotNull(PrerenderedPages::find('home.localized', 'sk'));
    }
}

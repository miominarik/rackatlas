<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class ApiDocsTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_guests_can_read_the_documentation(): void
    {
        $response = $this->get(route('api-docs'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('api-docs')
                ->has('baseUrl')
                ->has('scopes')
                ->has('intervals'));

        $this->assertStringNotContainsString('noindex', (string) $response->headers->get('X-Robots-Tag'));
    }

    public function test_sitemap_lists_the_documentation(): void
    {
        $this->get('/sitemap.xml')->assertOk()->assertSee('api-docs', false);
    }
}

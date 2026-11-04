<?php

namespace Tests\Feature;

use Tests\TestCase;

class SecurityHeadersTest extends TestCase
{
    public function test_responses_carry_the_security_headers(): void
    {
        $response = $this->get('/up', ['X-Forwarded-Proto' => 'https']);

        $response->assertHeader('Permissions-Policy');
        $response->assertHeader('Cross-Origin-Opener-Policy', 'same-origin');

        if (file_exists(public_path('hot'))) {
            $this->markTestIncomplete('The Vite dev server is running, so the Content-Security-Policy is skipped.');
        }

        $response->assertHeader('Content-Security-Policy');
        $response->assertHeader('Content-Security-Policy-Report-Only');
    }

    public function test_hsts_is_sent_only_over_https(): void
    {
        $this->get('http://localhost/up')->assertHeaderMissing('Strict-Transport-Security');
        $this->get('https://localhost/up')->assertHeader('Strict-Transport-Security');
    }
}

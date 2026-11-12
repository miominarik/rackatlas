<?php

namespace Tests\Feature;

use App\Support\NativeApp;
use Tests\TestCase;

class NativeAppHomeTest extends TestCase
{
    public function test_the_mobile_app_is_sent_from_the_home_page_to_the_login(): void
    {
        $agent = 'Mozilla/5.0 '.NativeApp::USER_AGENT_TOKEN;

        $this->withHeader('User-Agent', $agent)->get('/')->assertRedirect(route('login'));
        $this->withHeader('User-Agent', $agent)->get('/sk')->assertRedirect(route('login'));
    }

    public function test_browsers_still_get_the_home_page(): void
    {
        $this->get('/')->assertOk();
    }
}

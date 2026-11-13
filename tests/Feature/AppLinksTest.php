<?php

namespace Tests\Feature;

use Tests\TestCase;

class AppLinksTest extends TestCase
{
    public function test_the_android_app_is_linked_to_the_site_with_its_signing_fingerprints(): void
    {
        config(['services.android_app.sha256_fingerprints' => 'AA:BB, CC:DD']);

        $this->getJson('/.well-known/assetlinks.json')
            ->assertOk()
            ->assertJsonPath('0.relation.0', 'delegate_permission/common.handle_all_urls')
            ->assertJsonPath('0.target.namespace', 'android_app')
            ->assertJsonPath('0.target.package_name', 'dev.rackatlas.app')
            ->assertJsonPath('0.target.sha256_cert_fingerprints', ['AA:BB', 'CC:DD']);
    }
}

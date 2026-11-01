<?php

namespace App\Support;

/**
 * The external sign-in providers. A provider is offered only when its keys are configured.
 */
class SocialProviders
{
    /** @var array<string, string> */
    public const NAMES = ['microsoft' => 'Microsoft'];

    /**
     * @return array<int, array{id: string, name: string}>
     */
    public static function enabled(): array
    {
        $providers = [];

        foreach (self::NAMES as $id => $name) {
            if (self::isEnabled($id)) {
                $providers[] = ['id' => $id, 'name' => $name];
            }
        }

        return $providers;
    }

    public static function isEnabled(string $provider): bool
    {
        return isset(self::NAMES[$provider])
            && filled(config("services.{$provider}.client_id"))
            && filled(config("services.{$provider}.client_secret"));
    }
}

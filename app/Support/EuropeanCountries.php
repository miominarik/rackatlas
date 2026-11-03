<?php

namespace App\Support;

/**
 * The countries a server can be placed in on the map: the European Union and its neighbours.
 */
class EuropeanCountries
{
    /** @var array<int, string> */
    public const EU = [
        'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE',
        'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
    ];

    /** @var array<int, string> */
    public const OTHER = ['GB', 'NO', 'CH', 'IS', 'UA', 'RS', 'AL', 'BA', 'ME', 'MK', 'MD'];

    /** @var array<int, string> */
    public const CODES = [...self::EU, ...self::OTHER];
}

import { mapCountries } from '@/lib/europe-map-data';

/**
 * The countries a server can be placed in: the European Union first, then its neighbours.
 */
export const countryCodes: string[] = [...mapCountries]
    .sort((a, b) => Number(b.eu) - Number(a.eu))
    .map((country) => country.code);

/**
 * The name of a country in the language of the interface.
 */
export function countryName(code: string, locale: string): string {
    try {
        return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
    } catch {
        return code;
    }
}

/**
 * Countries sorted by their name in the language of the interface.
 */
export function sortedCountries(locale: string): { code: string; name: string }[] {
    return countryCodes
        .map((code) => ({ code, name: countryName(code, locale) }))
        .sort((a, b) => a.name.localeCompare(b.name, locale));
}

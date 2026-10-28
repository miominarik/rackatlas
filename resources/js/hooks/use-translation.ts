import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

type Replacements = Record<string, string | number>;

export function translate(
    translations: Record<string, string>,
    key: string | undefined,
    replacements: Replacements = {},
): string {
    if (!key) {
        return '';
    }

    let line = translations[key] ?? key;

    for (const [name, value] of Object.entries(replacements)) {
        line = line.replaceAll(`:${name}`, String(value));
    }

    return line;
}

export function useTranslation() {
    const { translations, locale } = usePage<{
        translations: Record<string, string>;
        locale: string;
    }>().props;

    return {
        locale,
        t: (key?: string, replacements?: Replacements) =>
            translate(translations, key, replacements),
    };
}

/**
 * Keep the <html lang> attribute in sync when the language changes without a full reload.
 */
export function useDocumentLocale(): void {
    const { locale } = usePage<{ locale: string }>().props;

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);
}

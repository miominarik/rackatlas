import type { ReactNode } from 'react';
import CookieConsent from '@/components/cookie-consent';
import { useDocumentLocale } from '@/hooks/use-translation';

/**
 * Pages for visitors that are not signed in: no sidebar, the page draws everything itself.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
    useDocumentLocale();

    return (
        <>
            {children}
            <CookieConsent />
        </>
    );
}

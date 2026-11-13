import { useEffect } from 'react';
import { useDocumentLocale } from '@/hooks/use-translation';
import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout';
import { resetNativePrompts } from '@/lib/native';

export default function AuthLayout({
    title = '',
    description = '',
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    useDocumentLocale();

    // Whoever lands on a sign-in page is signed out: ask about push and biometrics again after signing in.
    useEffect(() => resetNativePrompts(), []);

    return (
        <AuthLayoutTemplate title={title} description={description}>
            {children}
        </AuthLayoutTemplate>
    );
}

import { Head, router, usePage } from '@inertiajs/react';
import LanguageController from '@/actions/App/Http/Controllers/Settings/LanguageController';
import Heading from '@/components/heading';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import { edit } from '@/routes/language';

export default function Language() {
    const { t, locale } = useTranslation();
    const { locales } = usePage<{ locales: Record<string, string> }>().props;

    return (
        <>
            <Head title={t('Language settings')} />

            <h1 className="sr-only">{t('Language settings')}</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title={t('Language')}
                    description={t('Choose the language of the application')}
                />

                <div className="grid gap-2">
                    <Label htmlFor="locale">{t('Language')}</Label>
                    <Select
                        value={locale}
                        onValueChange={(value) =>
                            router.put(
                                LanguageController.update.url(),
                                { locale: value },
                                { preserveScroll: true },
                            )
                        }
                    >
                        <SelectTrigger id="locale" className="w-full sm:w-64">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(locales).map(([code, name]) => (
                                <SelectItem key={code} value={code}>
                                    {name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </>
    );
}

Language.layout = {
    breadcrumbs: [
        {
            title: 'Language settings',
            href: edit(),
        },
    ],
};

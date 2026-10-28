import { Form, router } from '@inertiajs/react';
import { Check, Pencil, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import ServerCategoryController from '@/actions/App/Http/Controllers/Servers/ServerCategoryController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { dotClass } from '@/lib/server-colors';
import type { ServerCategory } from '@/types';

function ColorPicker({
    colors,
    value,
    onChange,
}: {
    colors: string[];
    value: string;
    onChange: (color: string) => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="flex gap-1.5" role="radiogroup" aria-label={t('Color')}>
            {colors.map((color) => (
                <button
                    key={color}
                    type="button"
                    role="radio"
                    aria-checked={value === color}
                    aria-label={color}
                    onClick={() => onChange(color)}
                    className={cn(
                        'size-5 rounded-full ring-offset-2 ring-offset-background transition',
                        dotClass(color),
                        value === color
                            ? 'ring-2 ring-foreground'
                            : 'opacity-60 hover:opacity-100',
                    )}
                />
            ))}
        </div>
    );
}

function CategoryRow({
    category,
    colors,
}: {
    category: ServerCategory;
    colors: string[];
}) {
    const { t } = useTranslation();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(category.name);
    const [color, setColor] = useState(category.color);
    const [error, setError] = useState<string | undefined>();

    const save = () => {
        router.patch(
            ServerCategoryController.update.url(category.id),
            { name, color },
            {
                preserveScroll: true,
                onSuccess: () => setEditing(false),
                onError: (errors) => setError(errors.name ?? errors.color),
            },
        );
    };

    if (editing) {
        return (
            <li className="space-y-2 p-3">
                <div className="flex items-center gap-2">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && save()}
                    />
                    <Button size="icon" variant="ghost" onClick={save} aria-label={t('Save')}>
                        <Check className="size-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                            setEditing(false);
                            setName(category.name);
                            setColor(category.color);
                            setError(undefined);
                        }}
                        aria-label={t('Cancel')}
                    >
                        <X className="size-4" />
                    </Button>
                </div>
                <ColorPicker colors={colors} value={color} onChange={setColor} />
                <InputError message={error} />
            </li>
        );
    }

    return (
        <li className="flex items-center gap-3 p-3">
            <span className={cn('size-2.5 rounded-full', dotClass(category.color))} />
            <span className="min-w-0 flex-1 truncate font-medium">{category.name}</span>
            <span className="text-xs text-muted-foreground">
                {t(':count servers', { count: category.servers_count ?? 0 })}
            </span>
            <Button
                size="icon"
                variant="ghost"
                onClick={() => setEditing(true)}
                aria-label={t('Edit')}
            >
                <Pencil className="size-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                aria-label={t('Delete')}
                onClick={() => {
                    if (
                        window.confirm(
                            t('Delete the category :name? Its servers stay, just without a category.', {
                                name: category.name,
                            }),
                        )
                    ) {
                        router.delete(ServerCategoryController.destroy.url(category.id), {
                            preserveScroll: true,
                        });
                    }
                }}
            >
                <Trash2 className="size-4" />
            </Button>
        </li>
    );
}

export default function CategoryManager({
    categories,
    colors,
    trigger,
}: {
    categories: ServerCategory[];
    colors: string[];
    trigger: React.ReactNode;
}) {
    const { t } = useTranslation();
    const [color, setColor] = useState(colors[1] ?? colors[0]);

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogTitle>{t('Server categories')}</DialogTitle>
                <DialogDescription>
                    {t('Group servers, for example by provider, project or client.')}
                </DialogDescription>

                {categories.length > 0 && (
                    <ul className="max-h-72 divide-y overflow-auto rounded-lg border">
                        {categories.map((category) => (
                            <CategoryRow
                                key={category.id}
                                category={category}
                                colors={colors}
                            />
                        ))}
                    </ul>
                )}

                <Form
                    {...ServerCategoryController.store.form()}
                    options={{ preserveScroll: true }}
                    resetOnSuccess
                    transform={(data) => ({ ...data, color })}
                    className="space-y-3"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="flex items-center gap-2">
                                <Input
                                    name="name"
                                    required
                                    placeholder={t('New category name')}
                                />
                                <Button disabled={processing}>
                                    {processing && <Spinner />}
                                    {t('Add')}
                                </Button>
                            </div>
                            <ColorPicker colors={colors} value={color} onChange={setColor} />
                            <InputError message={errors.name ?? errors.color} />
                        </>
                    )}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

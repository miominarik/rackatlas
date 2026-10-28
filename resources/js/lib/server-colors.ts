export const categoryDotClass: Record<string, string> = {
    slate: 'bg-slate-500',
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    violet: 'bg-violet-500',
    pink: 'bg-pink-500',
};

export function dotClass(color: string): string {
    return categoryDotClass[color] ?? categoryDotClass.slate;
}

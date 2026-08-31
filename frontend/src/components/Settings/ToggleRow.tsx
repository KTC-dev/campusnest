import { useCallback } from "react";

export function ToggleRow({ label, description, checked, onChange, disabled = false }: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    disabled?: boolean;
}) {
    const handleClick = useCallback(() => {
        if (disabled) return;
        onChange(!checked);
    }, [checked, onChange, disabled]);

    return (
        <div className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 p-4">
            <div className="min-w-0 text-left">
                <div className="text-sm font-medium text-text.primary">{label}</div>
                {description && <p className="mt-1 text-xs text-text.secondary">{description}</p>}
            </div>
            <button
                role="switch"
                aria-checked={checked}
                onClick={handleClick}
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 ${checked ? "bg-primary-600" : "bg-slate-200 dark:bg-slate-700"}`}
            >
                <span className={`${checked ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
        </div>
    );
}

import { ReactNode } from "react";

export function SettingsRow({
    title,
    subtitle,
    onClick,
    right,
    className = "",
}: {
    title: string;
    subtitle?: string;
    onClick?: () => void;
    right?: ReactNode;
    className?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group flex w-full items-center justify-between gap-3 rounded-2xl bg-white/60 dark:bg-slate-800/60 p-4 transition hover:shadow-md ${className}`}
        >
            <div className="min-w-0 text-left">
                <p className="text-sm font-medium text-text.primary truncate">{title}</p>
                {subtitle && <p className="mt-1 text-xs text-text.secondary truncate">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">{right || (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary transition-transform duration-150 transform group-hover:translate-x-1"><polyline points="9 18 15 12 9 6" /></svg>
            )}</div>
        </button>
    );
}

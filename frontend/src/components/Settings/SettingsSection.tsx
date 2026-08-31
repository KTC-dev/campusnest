import { ReactNode } from "react";

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">{title}</p>
            <div className="space-y-2">{children}</div>
        </div>
    );
}

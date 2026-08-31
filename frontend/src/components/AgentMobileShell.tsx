import { ReactNode } from "react";
import { BottomNav, IconHome, IconProperties, IconAddProperty, IconMessages, IconProfile, IconSettings } from "@/components/ui/BottomNav";

type AgentMobileShellProps = {
    children: ReactNode;
};

const navItems = [
    { label: "Home", to: "/dashboard", icon: <IconHome /> },
    { label: "Properties", to: "/dashboard/properties", icon: <IconProperties /> },
    { label: "Add Property", to: "/dashboard/listings/new", icon: <IconAddProperty /> },
    { label: "Messages", to: "/conversations", icon: <IconMessages /> },
    { label: "Settings", to: "/settings", icon: <IconSettings /> },
    { label: "Profile", to: "/profile", icon: <IconProfile /> },
];

export function AgentMobileShell({ children }: AgentMobileShellProps) {
    return (
        <div className="min-h-screen bg-cream-50 text-slate-800">
            <main className="mx-auto flex min-h-screen w-full max-w-md flex-col pb-24">
                <header className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-brand-900 to-primary-800 px-5 py-4 shadow-brand sm:mx-5 sm:rounded-[28px] sm:px-6 sm:py-5">
                    <p className="font-display text-lg font-bold text-white tracking-tight">Edurus</p>
                    <p className="mt-0.5 text-xs text-brand-100/90">Agent Dashboard</p>
                </header>
                <div className="flex-1 px-4 pb-6 pt-4 sm:px-5">{children}</div>
                <BottomNav items={navItems} />
            </main>
        </div>
    );
}

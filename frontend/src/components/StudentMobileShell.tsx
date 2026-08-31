import { ReactNode } from "react";
import { BottomNav, IconHome, IconBrowse, IconRoommates, IconMessages, IconProfile, IconSettings } from "@/components/ui/BottomNav";

type StudentMobileShellProps = {
    children: ReactNode;
};

const navItems = [
    { label: "Home", to: "/dashboard", icon: <IconHome /> },
    { label: "Browse", to: "/properties", icon: <IconBrowse /> },
    { label: "Roommates", to: "/roommates", icon: <IconRoommates /> },
    { label: "Messages", to: "/conversations", icon: <IconMessages /> },
    { label: "Settings", to: "/settings", icon: <IconSettings /> },
    { label: "Profile", to: "/profile", icon: <IconProfile /> },
];

export function StudentMobileShell({ children }: StudentMobileShellProps) {
    return (
        <div className="min-h-screen bg-cream-50 text-slate-800">
            <main className="mx-auto flex min-h-screen w-full max-w-md flex-col pb-24">
                <header className="mx-4 mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-900 to-primary-800 px-5 py-4 shadow-brand sm:mx-5 sm:rounded-[28px] sm:px-6 sm:py-5">
                    <p className="font-display text-lg font-bold text-white tracking-tight">Edurus</p>
                    <p className="mt-0.5 text-xs text-brand-100/90">Student Portal</p>
                </header>
                <div className="flex-1 px-4 pb-6 pt-4 sm:px-5">{children}</div>
                <BottomNav items={navItems} />
            </main>
        </div>
    );
}
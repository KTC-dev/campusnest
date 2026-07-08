import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

type StudentMobileShellProps = {
    children: ReactNode;
};

type NavItem = {
    label: string;
    to: string;
    icon: string;
    anchor?: string;
};

const navItems: NavItem[] = [
    { label: "Home", to: "/dashboard", icon: "⌂" },
    { label: "Browse", to: "/properties", icon: "⌕" },
    { label: "Saved", to: "/dashboard", icon: "♡", anchor: "saved-listings" },
    { label: "Messages", to: "/conversations", icon: "✉" },
    { label: "Profile", to: "/profile", icon: "◌" },
] as const;

export function StudentMobileShell({ children }: StudentMobileShellProps) {
    const location = useLocation();
    const user = useAuthStore((state) => state.user);

    return (
        <div className="min-h-screen bg-cream-50 text-slate-800">
            <main className="mx-auto flex min-h-screen w-full max-w-md flex-col pb-24">
                <div className="flex-1 px-4 pb-6 pt-4 sm:px-5">{children}</div>

                <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-900/10 bg-white/90 backdrop-blur-xl">
                    <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 py-2">
                        {navItems.map((item) => {
                            const active = location.pathname === item.to;
                            const href = item.anchor ? `${item.to}#${item.anchor}` : item.to;

                            return (
                                <Link
                                    key={item.label}
                                    to={href}
                                    className={`flex min-h-[64px] flex-col items-center justify-center rounded-2xl px-2 text-[11px] font-semibold transition-all duration-200 active:scale-95 ${active ? "bg-brand-900 text-white shadow-soft" : "text-slate-500 hover:bg-cream-100 active:bg-cream-100"}`}
                                >
                                    <span className="text-lg leading-none">{item.icon}</span>
                                    <span className="mt-1">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                    {user?.role === "STUDENT" && <div className="h-[env(safe-area-inset-bottom)]" />}
                </nav>
            </main>
        </div>
    );
}
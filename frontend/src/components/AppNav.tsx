import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { NotificationBell } from "@/components/NotificationBell";

export function AppNav() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-xl shadow-premium">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-6 lg:px-8" aria-label="Main">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="font-display text-base font-semibold text-text.primary sm:text-lg">Edurus</span>
        </Link>

        {user && (
          <div className="hidden items-center gap-4 lg:flex">
            <Link to="/properties" className="text-sm font-medium text-text.secondary transition-colors duration-200 hover:text-primary">Properties</Link>
            <Link to="/dashboard" className="text-sm font-medium text-text.secondary transition-colors duration-200 hover:text-primary">Dashboard</Link>
            <Link to="/settings" className="text-sm font-medium text-text.secondary transition-colors duration-200 hover:text-primary">Settings</Link>
            <Link to="/profile" className="text-sm font-medium text-text.secondary transition-colors duration-200 hover:text-primary">Profile</Link>
            {user.role === "STUDENT" && <Link to="/conversations" className="text-sm font-medium text-text.secondary transition-colors duration-200 hover:text-primary">Messages</Link>}
            {user.role === "STUDENT" && <Link to="/roommates" className="text-sm font-medium text-text.secondary transition-colors duration-200 hover:text-primary">Roommates</Link>}
            <NotificationBell />
            <Button variant="ghost" size="sm" onClick={logout}>Log out</Button>
          </div>
        )}

        {!user && (
          <div className="hidden items-center gap-2.5 lg:flex">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">Sign up</Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

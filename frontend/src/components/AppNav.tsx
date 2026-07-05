import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { NotificationBell } from "./NotificationBell";

export function AppNav() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 md:px-12">
      <Link to="/" className="text-lg font-bold text-brand-900">
        CampusNest
      </Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link to="/properties" className="text-slate-600 hover:text-brand-600">
          Browse
        </Link>
        {user?.role === "STUDENT" && (
          <Link to="/dashboard" className="text-slate-600 hover:text-brand-600">
            Favourites
          </Link>
        )}
        {user?.role === "STUDENT" && (
          <Link to="/roommates" className="text-slate-600 hover:text-brand-600">
            Roommates
          </Link>
        )}
        {user?.role === "LANDLORD" && (
          <Link to="/dashboard" className="text-slate-600 hover:text-brand-600">
            My listings
          </Link>
        )}
        {user?.role === "ADMIN" && (
          <Link to="/admin" className="text-slate-600 hover:text-brand-600">
            Admin
          </Link>
        )}
        {user && (
          <Link to="/conversations" className="text-slate-600 hover:text-brand-600">
            Messages
          </Link>
        )}
        {user && (
          <Link to="/profile" className="text-slate-600 hover:text-brand-600">
            Profile
          </Link>
        )}
        {user && <NotificationBell />}
        {user ? (
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="rounded-full border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:border-brand-400"
          >
            Log out
          </button>
        ) : (
          <Link
            to="/login"
            className="rounded-full bg-brand-500 px-3 py-1.5 font-semibold text-white hover:bg-brand-600"
          >
            Log in
          </Link>
        )}
      </nav>
    </header>
  );
}

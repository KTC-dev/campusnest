import { Link } from "react-router-dom";
import { useState } from "react";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Properties", to: "/properties" },
  { label: "Find a Roommate", to: "/roommates" },
  { label: "Become a Landlord", to: "/register?role=landlord" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-900/10 bg-cream-50/90 backdrop-blur-xl shadow-[0_8px_30px_-20px_rgba(20,83,45,0.35)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-900/15 bg-white text-lg font-semibold text-brand-900 shadow-sm">
            C
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-brand-950">CampusNest</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Student homes</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className="transition-colors hover:text-brand-900">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link to="/login" className="text-sm font-medium text-slate-600 transition-colors hover:text-brand-900">
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-950"
          >
            Sign up
          </Link>
        </div>

        <button
          className="rounded-full border border-brand-900/10 bg-white p-2 text-slate-700 lg:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-brand-900/10 bg-white/95 px-5 py-4 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="block py-2 text-sm font-medium text-slate-600"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 flex gap-3 border-t border-brand-900/10 pt-3">
            <Link to="/login" className="text-sm font-medium text-slate-600">
              Login
            </Link>
            <Link to="/register" className="text-sm font-semibold text-brand-900">
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

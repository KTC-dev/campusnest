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
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
      <div className="flex items-center justify-between px-6 py-4 md:px-12">
        <Link to="/" className="text-xl font-bold text-brand-900">
          CampusNest
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className="hover:text-brand-600 transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-brand-600">
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Sign up
          </Link>
        </div>

        <button
          className="lg:hidden text-slate-600"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-100 px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link key={link.label} to={link.to} className="block text-sm font-medium text-slate-600" onClick={() => setMobileOpen(false)}>
              {link.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Link to="/login" className="text-sm font-medium text-slate-600">
              Log in
            </Link>
            <Link to="/register" className="text-sm font-semibold text-brand-600">
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

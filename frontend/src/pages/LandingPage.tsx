import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <span className="text-xl font-bold text-brand-900">CampusHaven</span>
        <nav className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-brand-600">
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center px-6 md:px-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-brand-900 leading-tight">
            Verified student accommodation, without the guesswork.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            CampusHaven connects Federal University Otuoke students with verified landlords and
            compatible roommates — one platform, built for your campus.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              to="/register"
              className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              Find accommodation
            </Link>
            <Link
              to="/register?role=landlord"
              className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:border-brand-400 transition-colors"
            >
              List a property
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

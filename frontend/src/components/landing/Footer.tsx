import { Link } from "react-router-dom";

const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Cookie Preferences", to: "/privacy" },
    ],
  },
  {
    title: "Support",
    links: [{ label: "Help Center", to: "/help" }],
  },
];

export function FinalCTASection() {
  return (
    <section className="bg-brand-900 px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-white/15 bg-white/10 p-8 text-center shadow-sm backdrop-blur-sm sm:p-10 lg:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-100">
          Ready when you are
        </p>
        <h2 className="mt-4 font-display text-3xl font-semibold text-white sm:text-4xl">
          Ready to find your next home?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-brand-50/80">
          Join students already using Edurus to find verified housing, compare listings, and book with confidence.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-base font-semibold text-brand-900 shadow-sm transition-all duration-200 hover:bg-cream-100 hover:shadow-premium active:scale-95"
          >
            Create account
          </Link>
          <Link
            to="/properties"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 px-7 text-base font-semibold text-white transition-all duration-200 hover:bg-white/10 active:scale-95"
          >
            Browse properties
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative bg-slate-950 px-5 pt-16 pb-10 text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-lg font-semibold text-white">Edurus</p>
          <p className="mt-3 max-w-xs text-sm leading-7 text-slate-400">
            Verified student accommodation and roommate matching, built for student life with clarity and trust.
          </p>
          <div className="mt-6 flex gap-5 text-sm">
            <a href="#" aria-label="Twitter" className="rounded-full bg-slate-800 px-4 py-1.5 transition-colors duration-200 hover:bg-slate-700 hover:text-white">Twitter</a>
            <a href="#" aria-label="Instagram" className="rounded-full bg-slate-800 px-4 py-1.5 transition-colors duration-200 hover:bg-slate-700 hover:text-white">Instagram</a>
            <a href="#" aria-label="Facebook" className="rounded-full bg-slate-800 px-4 py-1.5 transition-colors duration-200 hover:bg-slate-700 hover:text-white">Facebook</a>
          </div>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold uppercase tracking-wider text-white">{col.title}</p>
            <ul className="mt-5 space-y-3 text-sm">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="transition-colors duration-200 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 max-w-7xl border-t border-slate-800 pt-6 text-xs text-slate-500">
        © {new Date().getFullYear()} Edurus. All rights reserved.
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";

export function FinalCTASection() {
  return (
    <section className="bg-brand-900 px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl rounded-[32px] border border-white/15 bg-white/10 p-8 text-center shadow-sm backdrop-blur-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-100">Ready when you are</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
          Ready to find your next home?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-brand-50/80">
          Join students already using CampusNest to find verified housing, compare listings, and book with confidence.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/register" className="rounded-full bg-white px-6 py-3 font-semibold text-brand-900 transition-colors hover:bg-cream-100">
            Create account
          </Link>
          <Link to="/properties" className="rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10">
            Browse properties
          </Link>
        </div>
      </div>
    </section>
  );
}

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

export function Footer() {
  return (
    <footer className="bg-slate-950 px-5 py-12 text-slate-400 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
        <div>
          <p className="text-lg font-semibold text-white">CampusNest</p>
          <p className="mt-3 max-w-sm text-sm leading-7">Verified student accommodation and roommate matching, built for student life with clarity and trust.</p>
          <div className="mt-4 flex gap-4 text-sm">
            <a href="#" aria-label="Twitter" className="transition-colors hover:text-white">Twitter</a>
            <a href="#" aria-label="Instagram" className="transition-colors hover:text-white">Instagram</a>
            <a href="#" aria-label="Facebook" className="transition-colors hover:text-white">Facebook</a>
          </div>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-white">{col.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 pt-6 text-xs text-slate-500">
        © {new Date().getFullYear()} CampusNest. All rights reserved.
      </div>
    </footer>
  );
}

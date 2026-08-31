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
            <a
              href="https://www.tiktok.com/@edurus.ng"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-1.5 transition-all duration-200 hover:bg-slate-700 hover:scale-105"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.28 8.28 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span>TikTok</span>
            </a>
            <a
              href="https://www.instagram.com/edurus.ng"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-1.5 transition-all duration-200 hover:bg-slate-700 hover:scale-105"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
                <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85 0 3.2-.01 3.58-.07 4.85-.15 3.25-1.69 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07-3.2 0-3.58-.01-4.85-.07-4.27-.2-6.78-2.71-7-7C0 8.33.01 8.74.07 12c.2 4.27 2.71 6.78 7 7 1.27.06 1.69.07 4.85.07 3.2 0 3.58-.01 4.85-.07 4.27-.2 6.78-2.71 7-7 .06-1.27.07-1.69.07-4.85 0-3.2-.01-3.58-.07-4.85-.2-4.27-2.71-6.78-7-7C15.67.01 15.26 0 12 0zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.69a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>
              </svg>
              <span>Instagram</span>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61591878614353"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-4 py-1.5 transition-all duration-200 hover:bg-slate-700 hover:scale-105"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px] shrink-0" aria-hidden="true">
                <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z"/>
              </svg>
              <span>Facebook</span>
            </a>
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


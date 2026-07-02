import { Link } from "react-router-dom";

export function FinalCTASection() {
  return (
    <section className="px-6 py-16 md:px-12 text-center bg-brand-900">
      <h2 className="text-2xl md:text-3xl font-bold text-white">Ready to find your next home?</h2>
      <p className="mt-2 text-brand-50/80">Join students already using CampusNest to find verified housing near FUO.</p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/register"
          className="rounded-full bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
        >
          Get Started
        </Link>
        <Link
          to="/properties"
          className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
        >
          Browse Properties
        </Link>
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
    ],
  },
  {
    title: "Support",
    links: [{ label: "Help Center", to: "/help" }],
  },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 px-6 py-12 md:px-12">
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8 md:grid-cols-5">
        <div className="col-span-2">
          <p className="text-lg font-bold text-white">CampusNest</p>
          <p className="mt-2 text-sm max-w-xs">Verified student accommodation and roommate matching, built for FUO.</p>
          <div className="mt-4 flex gap-3 text-sm">
            <a href="#" aria-label="Twitter" className="hover:text-white">Twitter</a>
            <a href="#" aria-label="Instagram" className="hover:text-white">Instagram</a>
            <a href="#" aria-label="Facebook" className="hover:text-white">Facebook</a>
          </div>
        </div>

        {footerColumns.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold text-white">{col.title}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-slate-800 text-xs text-slate-500">
        © {new Date().getFullYear()} CampusNest. All rights reserved.
      </div>
    </footer>
  );
}

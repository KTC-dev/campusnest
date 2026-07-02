import { Link } from "react-router-dom";

const whyChoose = [
  { icon: "🏠", title: "Verified Properties", body: "Every listing is reviewed by our team before it goes live — no fake photos, no surprise fees." },
  { icon: "🔒", title: "Secure Booking", body: "Send a booking request and track its status in real time, right from your dashboard." },
  { icon: "🤝", title: "Roommate Matching", body: "Get compatibility-scored roommate suggestions based on budget, habits, and lifestyle." },
  { icon: "📍", title: "Near Campus", body: "Filter by exact distance from FUO so you're never further from class than you planned." },
  { icon: "⭐", title: "Trusted Landlords", body: "Landlord profiles show verification status, so you know who you're dealing with." },
  { icon: "💬", title: "Direct Communication", body: "Message landlords and coordinate viewings without leaving the platform." },
];

export function WhyChooseSection() {
  return (
    <section className="bg-slate-50 px-6 py-16 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-brand-900 text-center">Why choose CampusNest?</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyChoose.map((item) => (
            <div key={item.title} className="rounded-2xl bg-white border border-slate-100 p-6">
              <span className="text-3xl">{item.icon}</span>
              <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="px-6 py-16 md:px-12 max-w-6xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-brand-900 text-center">How it works</h2>

      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wide">For students</p>
          <ol className="mt-4 space-y-4">
            {["Sign up", "Search accommodation", "Book your room", "Move in"].map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="text-sm font-semibold text-brand-500 uppercase tracking-wide">For landlords</p>
          <ol className="mt-4 space-y-4">
            {["Register", "Verify your account", "Upload your property", "Receive booking requests"].map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <span className="text-slate-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function RoommateMatchingSection() {
  return (
    <section className="bg-brand-900 px-6 py-16 md:px-12">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Not looking to live alone?</h2>
        <p className="mt-3 text-brand-50/80">
          Tell us your budget, sleep schedule, and cleanliness habits — we'll score you against every other active
          student profile at FUO and rank your best-fit roommates.
        </p>
        <Link
          to="/roommates"
          className="mt-6 inline-block rounded-full bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
        >
          Find a Roommate
        </Link>
      </div>
    </section>
  );
}

const landlordBenefits = [
  "Reach verified students actively searching for housing near campus",
  "Manage every listing, booking request, and occupancy stat from one dashboard",
  "Get paid faster with a streamlined approval flow — no back-and-forth via DMs",
  "Build a track record: verified landlord status builds trust with prospective tenants",
];

export function BecomeLandlordSection() {
  return (
    <section className="px-6 py-16 md:px-12 max-w-6xl mx-auto">
      <div className="rounded-3xl bg-brand-50 p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-brand-900">Become a landlord</h2>
          <p className="mt-3 text-slate-600">
            List your property in minutes and reach students who are ready to book — not just browsing.
          </p>
          <Link
            to="/register?role=landlord"
            className="mt-6 inline-block rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Start Listing Today
          </Link>
        </div>
        <ul className="space-y-3">
          {landlordBenefits.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-brand-500 mt-0.5">✓</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

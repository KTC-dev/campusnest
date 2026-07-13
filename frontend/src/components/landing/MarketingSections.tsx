import { Link } from "react-router-dom";

const whyChoose = [
  { icon: "✓", title: "Verified Properties", body: "Every listing is manually reviewed, so you can browse with confidence." },
  { icon: "⏱", title: "Trusted Landlords", body: "See verified landlord profiles and clear listing details before you reach out." },
  { icon: "♡", title: "Roommate Matching", body: "Get compatibility-based roommate suggestions based on real lifestyle habits." },
  { icon: "⌖", title: "Near Campus", body: "Filter by distance so your home stays convenient for class, study, and errands." },
  { icon: "🔒", title: "Secure Booking", body: "Submit requests, track updates, and avoid awkward back-and-forth with built-in clarity." },
  { icon: "✦", title: "24/7 Support", body: "Helpful guidance is available whenever you need help moving from search to booking." },
];

export function WhyChooseSection() {
  return (
    <section className="bg-white/70 px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Why Edurus</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-brand-950 sm:text-4xl">
            A calmer way to find a place that feels right.
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {whyChoose.map((item) => (
            <div key={item.title} className="rounded-[24px] border border-brand-900/10 bg-cream-50 p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl text-brand-900 shadow-sm">
                {item.icon}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">How it works</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-brand-950 sm:text-4xl">
          Simple steps, from first search to move-in day.
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-[28px] border border-brand-900/10 bg-cream-50 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-900">For students</p>
          <div className="mt-6 space-y-4">
            {[
              { title: "Register", body: "Create your student profile in minutes." },
              { title: "Search", body: "Find homes that match your budget and preferences." },
              { title: "Book", body: "Send a request and track its status clearly." },
              { title: "Move in", body: "Settle in with confidence and a trusted landlord." },
            ].map((step, i) => (
              <div key={step.title} className="flex gap-4 rounded-2xl bg-white/80 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-900 text-sm font-semibold text-white">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{step.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-brand-900/10 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-900">For landlords</p>
          <div className="mt-6 space-y-4">
            {[
              { title: "Register", body: "Create a verified landlord profile." },
              { title: "Verify", body: "Build trust with applicants from the start." },
              { title: "Upload", body: "List each room or apartment with clear details." },
              { title: "Receive bookings", body: "Approve requests and manage everything from one place." },
            ].map((step, i) => (
              <div key={step.title} className="flex gap-4 rounded-2xl bg-cream-50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-400 text-sm font-semibold text-white">
                  {i + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{step.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function RoommateMatchingSection() {
  return (
    <section className="bg-brand-900 px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-100">Roommate matching</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
            Shared living should feel effortless.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-brand-50/80">
            Match with students whose budget, habits, and routines align with yours — making the first move into shared housing feel thoughtful rather than rushed.
          </p>
          <Link
            to="/roommates"
            className="mt-8 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-brand-900 transition-colors hover:bg-cream-100"
          >
            Find a roommate
          </Link>
        </div>
        <div className="rounded-[30px] border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
          <div className="rounded-[24px] bg-cream-50 p-6 text-brand-950">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Compatibility score</p>
                <p className="mt-2 text-4xl font-semibold">94%</p>
              </div>
              <div className="rounded-full bg-brand-900 px-3 py-1 text-sm font-semibold text-white">Best match</div>
            </div>
            <div className="mt-6 space-y-3 text-sm text-slate-700">
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <span>Budget fit</span>
                <span className="font-semibold text-brand-900">Excellent</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <span>Noise tolerance</span>
                <span className="font-semibold text-brand-900">Aligned</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3">
                <span>Cleanliness</span>
                <span className="font-semibold text-brand-900">Very similar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const landlordBenefits = [
  "Reach students who are actively looking for housing near campus",
  "Manage listings, requests, and occupancy in one streamlined dashboard",
  "Add a more trustworthy profile with verified landlord status",
  "Reduce back-and-forth with clearer booking visibility",
];

export function BecomeLandlordSection() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="grid items-center gap-8 rounded-[32px] border border-brand-900/10 bg-cream-50 p-8 shadow-sm md:grid-cols-[1fr_0.9fr] md:p-10 lg:p-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Become a landlord</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-brand-950 sm:text-4xl">
            List with clarity and reach students who are ready.
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
            Present your property professionally, manage requests thoughtfully, and build trust before the first conversation.
          </p>
          <Link
            to="/register?role=landlord"
            className="mt-8 inline-flex rounded-full bg-brand-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-950"
          >
            Start listing
          </Link>
        </div>
        <ul className="space-y-3 rounded-[24px] border border-brand-900/10 bg-white p-6 shadow-sm">
          {landlordBenefits.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm leading-7 text-slate-700">
              <span className="mt-1 text-brand-900">✓</span>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

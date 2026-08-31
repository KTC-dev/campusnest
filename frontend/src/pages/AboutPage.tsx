import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1 px-6 py-16 md:px-12 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-900">About Edurus</h1>
        <p className="mt-4 text-slate-600 leading-relaxed">
          Edurus connects students at Federal University Otuoke with verified agents and compatible
          roommates, so finding somewhere to live doesn't mean relying on word of mouth and unverified WhatsApp
          groups. Every listing goes through a review step before it's visible to students, and every booking
          request is tracked from request to approval.
        </p>
        <p className="mt-4 text-slate-600 leading-relaxed">
          We're starting at FUO, with an architecture built to expand to more universities as the platform grows.
        </p>
      </main>
      <Footer />
    </div>
  );
}

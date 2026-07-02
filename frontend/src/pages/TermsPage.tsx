import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1 px-6 py-16 md:px-12 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-900">Terms of Service</h1>
        <p className="mt-4 text-sm text-slate-500">
          Placeholder for the MVP. Replace with real terms — landlord listing obligations, booking cancellation
          policy, and platform liability — before accepting real bookings.
        </p>
      </main>
      <Footer />
    </div>
  );
}

import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";
import { LegalPolicySection } from "@/components/LegalPolicySection";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1 px-6 py-16 md:px-12 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-900">Terms of Service</h1>
        <p className="mt-4 text-sm text-slate-500">
          By using Edurus, you agree to use the platform responsibly, provide accurate information, and respect other users. Agents must submit truthful property and verification details, while students agree to use listings for lawful accommodation purposes.
        </p>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <p><strong>Listings:</strong> Agents remain responsible for the accuracy of their listings and must not post fraudulent or misleading content.</p>
          <p><strong>Bookings:</strong> cancellations and refunds are subject to the terms set by the listing owner and any applicable local law.</p>
          <p><strong>Liability:</strong> Edurus facilitates introductions and transactions but is not a party to every agreement between students and Agents.</p>
        </div>
        <LegalPolicySection />
      </main>
      <Footer />
    </div>
  );
}

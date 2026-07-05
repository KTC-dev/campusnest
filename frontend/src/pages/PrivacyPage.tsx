import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";
import { LegalPolicySection } from "@/components/LegalPolicySection";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1 px-6 py-16 md:px-12 max-w-2xl mx-auto prose-sm">
        <h1 className="text-3xl font-bold text-brand-900">Privacy Policy</h1>
        <p className="mt-4 text-sm text-slate-500">
          CampusNest collects the minimum data needed to create accounts, verify landlords, facilitate bookings, and improve the platform experience. We store account information, listing details, verification documents, booking activity, and communication metadata in a secure environment.
        </p>
        <div className="mt-6 space-y-4 text-sm text-slate-600">
          <p><strong>What we collect:</strong> name, email, phone number, university, verification documents, property details, and support messages.</p>
          <p><strong>How we use it:</strong> to create accounts, verify landlord identity, coordinate bookings, enable messaging, and meet legal or security obligations.</p>
          <p><strong>Your choices:</strong> you may request access, correction, or deletion of personal data by contacting support.</p>
        </div>
        <LegalPolicySection />
      </main>
      <Footer />
    </div>
  );
}

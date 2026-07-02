import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1 px-6 py-16 md:px-12 max-w-2xl mx-auto prose-sm">
        <h1 className="text-3xl font-bold text-brand-900">Privacy Policy</h1>
        <p className="mt-4 text-sm text-slate-500">
          Placeholder for the MVP. Replace with a real privacy policy — covering what data is collected (account
          details, booking history, roommate profile answers), how it's stored, and how students/landlords can
          request deletion — before real users sign up.
        </p>
      </main>
      <Footer />
    </div>
  );
}

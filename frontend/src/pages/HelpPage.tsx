import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";
import { FAQSection } from "@/components/landing/FAQSection";

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1">
        <div className="px-6 pt-16 md:px-12 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-brand-900">Help Center</h1>
          <p className="mt-2 text-slate-600">Start with the FAQ below — reach out via Contact if you need more.</p>
        </div>
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}

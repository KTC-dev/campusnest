import { FormEvent, useState } from "react";
import { MarketingNav } from "@/components/landing/MarketingNav";
import { Footer } from "@/components/landing/Footer";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // No backend endpoint for contact submissions yet — this is a UI
    // placeholder. Wire to a real /contact endpoint or a mail service
    // before relying on it in production.
    setSent(true);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MarketingNav />
      <main className="flex-1 px-6 py-16 md:px-12 max-w-xl mx-auto">
        <h1 className="text-3xl font-bold text-brand-900">Contact us</h1>
        <p className="mt-2 text-slate-600">Questions, feedback, or a listing to report? Send us a message.</p>

        {sent ? (
          <p className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
            Thanks — we'll get back to you soon.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input required placeholder="Your name" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input required type="email" placeholder="Your email" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <textarea required rows={4} placeholder="Message" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button type="submit" className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
              Send message
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

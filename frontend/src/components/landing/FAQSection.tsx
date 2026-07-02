import { useState } from "react";

const faqs = [
  {
    question: "How do I book a room?",
    answer:
      "Browse verified listings, open one you like, and tap \"Request to book.\" Pick a move-in date and add an optional note. The landlord approves or declines from their dashboard, and you'll see the status update in yours.",
  },
  {
    question: "Are listings verified?",
    answer:
      "Yes. Every listing goes into a pending review queue before it's visible to students, and an admin checks it before approving. You can also see whether the landlord's account itself is verified on the listing page.",
  },
  {
    question: "How do I become a landlord?",
    answer:
      "Sign up and choose \"Landlord\" during registration. Once your account is created you can list a property — it'll go live once approved. Verified landlord status appears on all of your listings.",
  },
  {
    question: "Can I find roommates?",
    answer:
      "Yes — fill out a short roommate profile (budget, sleep schedule, cleanliness, smoking, noise tolerance) and we'll rank other active students at your university by compatibility score.",
  },
  {
    question: "Is there a fee to use CampusNest?",
    answer:
      "Browsing and booking requests are free for students. Landlord listing fees, if any, will be communicated clearly before you list — nothing is charged without your knowledge.",
  },
  {
    question: "What if a listing turns out to be fraudulent?",
    answer:
      "Report it and our admin team can remove it immediately. Verification reduces this risk but doesn't eliminate it entirely, so always view a property in person before paying anything.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="px-6 py-16 md:px-12 max-w-3xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-brand-900 text-center">Frequently asked questions</h2>

      <div className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={faq.question}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-slate-900">{faq.question}</span>
                <span className={`text-slate-400 transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>
              {isOpen && <p className="px-6 pb-4 text-sm text-slate-600 leading-relaxed">{faq.answer}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

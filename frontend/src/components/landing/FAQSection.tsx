import { useState } from "react";

const faqs = [
  {
    question: "How do I book a room?",
    answer:
      "Browse verified listings, open one you like, and tap “Request to book.” Pick a move-in date and add an optional note. The landlord approves or declines from their dashboard, and you’ll see the status update in yours.",
  },
  {
    question: "Are listings verified?",
    answer:
      "Yes. Every listing enters a review queue before it becomes visible to students, and an admin verifies the listing before approval. You can also see whether the landlord account itself is verified on the listing page.",
  },
  {
    question: "How do I become a landlord?",
    answer:
      "Sign up and choose “Landlord” during registration. Once your account is created, you can list a property — it will go live once approved. Verified landlord status appears on all of your listings.",
  },
  {
    question: "Can I find roommates?",
    answer:
      "Yes — fill out a short roommate profile with your budget, sleep schedule, cleanliness habits, smoking preference, and noise tolerance. We’ll rank other active students at your university by compatibility score.",
  },
  {
    question: "Is there a fee to use CampusNest?",
    answer:
      "Browsing and booking requests are free for students. Any landlord listing fees, if introduced, will be communicated clearly before you list, and nothing is charged without your knowledge.",
  },
  {
    question: "What if a listing turns out to be fraudulent?",
    answer:
      "Report it and our admin team can remove it immediately. Verification reduces this risk but does not eliminate it entirely, so always view a property in person before paying anything.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-5xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">FAQ</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-brand-950 sm:text-4xl">
          Questions answered plainly.
        </h2>
      </div>

      <div className="mt-10 divide-y divide-brand-900/10 rounded-[28px] border border-brand-900/10 bg-white shadow-sm">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={faq.question}>
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left sm:px-8"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-slate-900">{faq.question}</span>
                <span className={`text-xl text-brand-900 transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
              </button>
              {isOpen && <p className="px-6 pb-6 text-sm leading-7 text-slate-600 sm:px-8">{faq.answer}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

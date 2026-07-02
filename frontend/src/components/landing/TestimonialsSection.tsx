import { useState } from "react";

// Placeholder testimonials — clearly marked as such in the surrounding page
// copy (or swapped for real reviews once the platform has users). Kept
// realistic in tone/length rather than generic filler so the layout reads
// correctly once real content replaces it.
const testimonials = [
  {
    quote:
      "I found a self-contain 10 minutes from campus in one afternoon. Seeing the landlord was verified before I even messaged them made the whole thing feel a lot less risky.",
    name: "Blessing A.",
    role: "300L, Computer Science",
  },
  {
    quote:
      "The roommate matching actually worked — got paired with someone whose schedule and cleanliness habits matched mine. No awkward surprises three weeks in.",
    name: "Daniel O.",
    role: "200L, Petroleum Engineering",
  },
  {
    quote:
      "As a landlord, I like that I can see booking requests and respond from one dashboard instead of juggling WhatsApp messages from five different students.",
    name: "Mrs. Ibim",
    role: "Landlord, Otuoke",
  },
];

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const testimonial = testimonials[index];

  return (
    <section className="px-6 py-16 md:px-12 max-w-3xl mx-auto text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-brand-900">What students are saying</h2>
      <p className="mt-1 text-xs text-slate-400">(Placeholder reviews for the MVP — real testimonials replace these post-launch.)</p>

      <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-8">
        <p className="text-lg text-slate-700 leading-relaxed">"{testimonial.quote}"</p>
        <p className="mt-4 font-semibold text-slate-900">{testimonial.name}</p>
        <p className="text-sm text-slate-500">{testimonial.role}</p>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Show testimonial ${i + 1}`}
            className={`h-2 w-2 rounded-full transition-colors ${i === index ? "bg-brand-500" : "bg-slate-300"}`}
          />
        ))}
      </div>
    </section>
  );
}

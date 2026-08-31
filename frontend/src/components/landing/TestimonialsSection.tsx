import { useState } from "react";

const testimonials = [
  {
    quote:
      "I found a self-contain 10 minutes from campus in one afternoon. Seeing that the agent was verified before I even messaged them made the whole thing feel a lot less risky.",
    name: "Blessing A.",
    role: "300L, Computer Science",
  },
  {
    quote:
      "The roommate matching actually worked — I got paired with someone whose habits and schedule matched mine. No awkward surprises three weeks in.",
    name: "Daniel O.",
    role: "200L, Petroleum Engineering",
  },
  {
    quote:
      "As an agent, I like that I can manage requests and respond from one dashboard instead of juggling WhatsApp messages from multiple students.",
    name: "Mrs. Ibim",
    role: "Agent, Otuoke",
  },
];

export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const testimonial = testimonials[index];

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Testimonials</p>
        <h2 className="mt-2 font-display text-3xl font-semibold text-brand-950 sm:text-4xl">
          Trusted by students and agents alike.
        </h2>
      </div>

      <div className="mt-10 rounded-[32px] border border-brand-900/10 bg-white p-8 shadow-sm sm:p-10">
        <div className="flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-900 text-lg font-semibold text-white">
            {testimonial.name.split(" ")[0][0]}
          </div>
        </div>
        <p className="mt-6 text-center text-lg leading-8 text-slate-700">“{testimonial.quote}”</p>
        <p className="mt-5 text-center font-semibold text-slate-900">{testimonial.name}</p>
        <p className="text-center text-sm text-slate-500">{testimonial.role}</p>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Show testimonial ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${i === index ? "bg-brand-900" : "bg-slate-300"}`}
          />
        ))}
      </div>
    </section>
  );
}

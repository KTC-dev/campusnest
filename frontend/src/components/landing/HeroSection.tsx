import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

const roomTypes = [
  { value: "", label: "Any type" },
  { value: "SELF_CONTAIN", label: "Self-contain" },
  { value: "SHARED", label: "Shared" },
  { value: "ONE_BEDROOM", label: "One bedroom" },
  { value: "TWO_BEDROOM", label: "Two bedroom" },
  { value: "HOSTEL", label: "Hostel" },
];

const genders = [
  { value: "", label: "Any gender" },
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
];

const collageImages = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
];

export function HeroSection() {
  const navigate = useNavigate();
  const [maxPrice, setMaxPrice] = useState("");
  const [roomType, setRoomType] = useState("");
  const [gender, setGender] = useState("");

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (roomType) params.set("roomType", roomType);
    if (gender) params.set("gender", gender);
    navigate(`/properties?${params.toString()}`);
  }

  return (
    <section className="relative overflow-hidden bg-cream-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,83,45,0.08),_transparent_38%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-900/10 bg-white/80 px-3 py-1 text-sm font-medium text-brand-900 shadow-sm">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-brand-400" /> Verified homes, trusted landlords
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-brand-950 sm:text-5xl lg:text-6xl">
            Find your perfect student home.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Discover verified accommodation, compare prices, book with confidence, and connect with roommates who fit your lifestyle.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="/properties"
              className="inline-flex items-center justify-center rounded-full bg-brand-900 px-6 py-3 font-semibold text-white transition-all hover:bg-brand-950"
            >
              Find accommodation
            </a>
            <a
              href="/register?role=landlord"
              className="inline-flex items-center justify-center rounded-full border border-brand-900/15 bg-white px-6 py-3 font-semibold text-brand-900 transition-all hover:border-brand-900/25 hover:bg-cream-100"
            >
              List your property
            </a>
          </div>

          <form onSubmit={handleSearch} className="mt-10 rounded-[24px] border border-brand-900/10 bg-white p-3 shadow-soft sm:p-4">
            <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]">
              <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="rounded-2xl border border-slate-200 bg-cream-50 px-4 py-3 text-sm text-slate-700 outline-none">
                {roomTypes.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Budget (₦/year)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="rounded-2xl border border-slate-200 bg-cream-50 px-4 py-3 text-sm text-slate-700 outline-none"
              />
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="rounded-2xl border border-slate-200 bg-cream-50 px-4 py-3 text-sm text-slate-700 outline-none">
                {genders.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-2xl bg-brand-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-950"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
            <img
              src={collageImages[0]}
              alt="Modern student accommodation"
              className="h-72 w-full rounded-[28px] object-cover shadow-soft"
              loading="eager"
            />
            <div className="space-y-3">
              <img
                src={collageImages[1]}
                alt="Bright shared apartment"
                className="h-34 w-full rounded-[24px] object-cover shadow-soft"
                loading="lazy"
              />
              <img
                src={collageImages[2]}
                alt="Comfortable room interior"
                className="h-34 w-full rounded-[24px] object-cover shadow-soft"
                loading="lazy"
              />
            </div>
          </div>

          <div className="absolute -left-3 top-8 rounded-2xl border border-brand-900/10 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-900">
              <span className="text-[#d4a017]">✓</span> Verified
            </p>
          </div>
          <div className="absolute bottom-5 right-2 rounded-2xl border border-brand-900/10 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:right-4">
            <p className="text-sm font-semibold text-brand-950">₦180,000 / year</p>
            <p className="text-xs text-slate-500">5 mins from campus</p>
          </div>
          <div className="absolute bottom-20 left-5 rounded-full border border-brand-900/10 bg-white/95 px-3 py-2 text-sm font-semibold text-brand-900 shadow-lg backdrop-blur">
            Available now
          </div>
        </div>
      </div>
    </section>
  );
}

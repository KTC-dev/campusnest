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
    <section className="relative overflow-hidden bg-brand-900">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=60')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-brand-900/60 via-brand-900/80 to-brand-900" />

      <div className="relative px-6 py-20 md:px-12 md:py-28 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          Find Your Perfect Student Home
        </h1>
        <p className="mt-4 text-lg text-brand-50/90 max-w-2xl mx-auto">
          Discover verified student accommodation, compare prices, and connect with trusted landlords — all in one
          place, built for FUO students.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/properties"
            className="rounded-full bg-white px-6 py-3 font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
          >
            Find Accommodation
          </a>
          <a
            href="/register?role=landlord"
            className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
          >
            List Your Property
          </a>
        </div>

        <form
          onSubmit={handleSearch}
          className="mt-10 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-xl sm:grid-cols-4"
        >
          <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            {roomTypes.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Max budget (₦/year)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
          />
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            {genders.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}

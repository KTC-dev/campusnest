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
  "/livingroom-1.png",
  "/livingroom-2.png",
  "/roommate.png",
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
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-8 lg:py-24">
        <div className="max-w-2xl page-enter">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-900/10 bg-white/90 px-4 py-2 text-sm font-semibold text-brand-900 shadow-soft">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-brand-400" />{" "}
            Verified homes, trusted agents
          </div>
          <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-brand-950 sm:text-5xl lg:text-6xl">
            Find your perfect student home.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Discover verified accommodation, compare prices, book with confidence, and connect with roommates who fit your lifestyle.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="/properties"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand-900 px-7 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-950 hover:shadow-premium active:scale-95"
            >
              Find accommodation
            </a>
            <a
              href="/register?role=agent"
              className="inline-flex h-12 items-center justify-center rounded-full border border-brand-900/15 bg-white px-7 text-base font-semibold text-brand-900 shadow-sm transition-all duration-200 hover:border-brand-900/25 hover:bg-cream-100 hover:shadow-premium active:scale-95"
            >
              List your property
            </a>
          </div>

          <form onSubmit={handleSearch} className="mt-8 rounded-[24px] border border-brand-900/10 bg-white p-3 shadow-soft sm:p-4">
            <div className="grid gap-2.5 md:grid-cols-[1.2fr_1fr_1fr_auto]">
              <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-cream-50 px-4 text-sm text-slate-700 outline-none transition-colors focus:border-brand-400">
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
                className="h-12 rounded-2xl border border-slate-200 bg-cream-50 px-4 text-sm text-slate-700 outline-none transition-colors focus:border-brand-400"
              />
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="h-12 rounded-2xl border border-slate-200 bg-cream-50 px-4 text-sm text-slate-700 outline-none transition-colors focus:border-brand-400">
                {genders.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="h-12 rounded-2xl bg-brand-900 px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-950 hover:shadow-premium active:scale-95"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:mx-0">
          <div className="flex flex-col gap-3">
            <img
              src={collageImages[0]}
              alt="Modern student accommodation interior"
              className="h-72 w-full rounded-[24px] object-cover shadow-soft-lg animate-fadeUp"
              loading="eager"
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <img
                  src={collageImages[1]}
                  alt="Bright living room"
                  className="h-36 w-full rounded-[24px] object-cover shadow-soft-lg animate-fadeUp"
                  style={{ animationDelay: "100ms" }}
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-[24px] bg-gradient-to-t from-brand-950/10 to-transparent pointer-events-none" />
              </div>
              <div className="relative">
                <img
                  src={collageImages[2]}
                  alt="Student roommate matching"
                  className="h-36 w-full rounded-[24px] object-cover shadow-soft-lg animate-fadeUp"
                  style={{ animationDelay: "200ms" }}
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-[24px] bg-gradient-to-t from-brand-950/10 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="absolute top-4 left-3 rounded-2xl border border-brand-900/10 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-xl sm:top-6 sm:left-4 animate-fadeUp" style={{ animationDelay: "300ms" }}>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-900">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4a017" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Verified
            </p>
          </div>
          <div className="absolute bottom-[140px] left-3 rounded-full border border-brand-900/10 bg-white/95 px-3 py-2 text-xs font-semibold text-brand-900 shadow-lg backdrop-blur-xl sm:bottom-[148px] sm:left-4 animate-fadeUp" style={{ animationDelay: "400ms" }}>
            Available now
          </div>
          <div className="absolute bottom-3 right-3 rounded-2xl border border-brand-900/10 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-xl sm:bottom-5 sm:right-4 animate-fadeUp" style={{ animationDelay: "500ms" }}>
            <p className="text-sm font-semibold text-brand-950">₦180,000 / year</p>
            <p className="text-xs text-text.secondary">5 mins from campus</p>
          </div>
        </div>
      </div>
    </section>
  );
}


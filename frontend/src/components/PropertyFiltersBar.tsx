import { Amenity, Gender, PropertyFilters, RoomType } from "@/types";

interface PropertyFiltersBarProps {
  filters: PropertyFilters;
  amenities: Amenity[];
  onChange: (filters: PropertyFilters) => void;
}

const roomTypes: RoomType[] = ["SELF_CONTAIN", "SHARED", "ONE_BEDROOM", "TWO_BEDROOM", "HOSTEL"];
const genders: Gender[] = ["ANY", "MALE", "FEMALE"];

export function PropertyFiltersBar({ filters, amenities, onChange }: PropertyFiltersBarProps) {
  function set<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
    onChange({ ...filters, [key]: value, page: 1 });
  }

  function toggleAmenity(id: string) {
    const current = filters.amenityIds ?? [];
    const next = current.includes(id) ? current.filter((a) => a !== id) : [...current, id];
    set("amenityIds", next.length ? next : undefined);
  }

  return (
    <aside className="space-y-6 rounded-2xl border border-slate-100 bg-white p-5">
      <div>
        <p className="text-sm font-semibold text-slate-700">Price range (₦/year)</p>
        <div className="mt-2 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ""}
            onChange={(e) => set("minPrice", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ""}
            onChange={(e) => set("maxPrice", e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-700">Max distance from campus</p>
        <input
          type="range"
          min={0}
          max={20}
          step={0.5}
          value={filters.maxDistanceKm ?? 20}
          onChange={(e) => set("maxDistanceKm", Number(e.target.value))}
          className="mt-2 w-full accent-brand-500"
        />
        <p className="text-xs text-slate-500">{filters.maxDistanceKm ?? 20}km or less</p>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-700">Gender</p>
        <div className="mt-2 flex gap-2">
          {genders.map((g) => (
            <button
              key={g}
              onClick={() => set("gender", filters.gender === g ? undefined : g)}
              className={`rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors ${filters.gender === g ? "border-brand-500 bg-brand-50 text-brand-600" : "border-slate-300 text-slate-600"
                }`}
            >
              {g.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-700">Room type</p>
        <select
          value={filters.roomType ?? ""}
          onChange={(e) => set("roomType", (e.target.value || undefined) as RoomType | undefined)}
          className="mt-2 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
        >
          <option value="">Any</option>
          {roomTypes.map((r) => (
            <option key={r} value={r}>
              {r.replace(/_/g, " ").toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {amenities.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-700">Amenities</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {amenities.map((a) => (
              <button
                key={a.id}
                onClick={() => toggleAmenity(a.id)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filters.amenityIds?.includes(a.id)
                    ? "border-brand-500 bg-brand-50 text-brand-600"
                    : "border-slate-300 text-slate-600"
                  }`}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={filters.availableOnly ?? true}
          onChange={(e) => set("availableOnly", e.target.checked)}
          className="rounded border-slate-300 accent-brand-500"
        />
        Available now only
      </label>
    </aside>
  );
}

import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { PropertyCard } from "@/components/PropertyCard";
import { propertyService } from "@/services/property.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { Gender, PropertyFilters, RoomType } from "@/types";
import { getFriendlyErrorMessage } from "@/utils/error";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PropertyCardSkeleton } from "@/components/ui/LoadingState";

function filtersFromSearchParams(params: URLSearchParams): PropertyFilters {
  const maxPrice = params.get("maxPrice");
  const roomType = params.get("roomType");
  const gender = params.get("gender");
  return {
    availableOnly: true,
    page: 1,
    ...(maxPrice ? { maxPrice: Number(maxPrice) } : {}),
    ...(roomType ? { roomType: roomType as RoomType } : {}),
    ...(gender ? { gender: gender as Gender } : {}),
  };
}

const recentSearches = [
  { label: "Self-contain under ₦300k", query: "?maxPrice=300000&roomType=SELF_CONTAIN" },
  { label: "5 mins from campus", query: "?maxDistanceKm=5" },
  { label: "Male only", query: "?gender=MALE" },
];

const roomTypes: RoomType[] = ["SELF_CONTAIN", "SHARED", "ONE_BEDROOM", "TWO_BEDROOM", "HOSTEL"];
const genders: Gender[] = ["ANY", "MALE", "FEMALE"];

export default function PropertyListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<PropertyFilters>(() => filtersFromSearchParams(searchParams));
  const [showFilters, setShowFilters] = useState(false);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  const { data: amenities = [] } = useQuery({
    queryKey: ["amenities"],
    queryFn: propertyService.listAmenities,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["properties", filters],
    queryFn: () => propertyService.list(filters),
  });

  const { data: favourites = [] } = useQuery({
    queryKey: ["favourites"],
    queryFn: propertyService.listFavourites,
    enabled: user?.role === "STUDENT",
  });
  const favouriteIds = new Set(favourites.map((f) => f.id));

  async function handleToggleFavourite(id: string) {
    if (user?.role !== "STUDENT") return;
    try {
      await propertyService.toggleFavourite(id);
      queryClient.invalidateQueries({ queryKey: ["favourites"] });
      addToast({ type: "success", title: "Saved property", message: "Your favourites have been updated." });
    } catch (error) {
      addToast({ type: "error", title: "Unable to update favourites", message: getFriendlyErrorMessage(error) });
    }
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const maxPrice = formData.get("searchMaxPrice") as string;
    const roomType = formData.get("searchRoomType") as string;
    const gender = formData.get("searchGender") as string;

    const next: PropertyFilters = { availableOnly: true, page: 1 };
    if (maxPrice) next.maxPrice = Number(maxPrice);
    if (roomType) next.roomType = roomType as RoomType;
    if (gender) next.gender = gender as Gender;

    setFilters(next);
    setSearchParams(Object.entries(next).filter(([, v]) => v !== undefined && v !== "").reduce((a, [k, v]) => ({ ...a, [k]: String(v) }), {}));
  }

  function handleRecentSearch(query: string) {
    const params = new URLSearchParams(query);
    const next = filtersFromSearchParams(params);
    setFilters(next);
    setSearchParams(params);
  }

  const activeFilterCount = [
    filters.maxPrice,
    filters.maxDistanceKm && filters.maxDistanceKm < 20,
    filters.gender,
    filters.roomType,
    filters.amenityIds && filters.amenityIds.length > 0,
  ].filter(Boolean).length;

  return (
    <StudentMobileShell>
      <div className="page-enter space-y-6">
        <section className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Browse</p>
            <h1 className="mt-1 font-display text-3xl font-semibold text-text.primary">Find your place</h1>
            <p className="mt-1 text-sm text-text.secondary">
              {data ? `${data.total} verified listing${data.total === 1 ? "" : "s"} near FUO` : "Loading listings…"}
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="number"
              name="searchMaxPrice"
              placeholder="Budget (₦/year)"
              defaultValue={filters.maxPrice ?? ""}
               className="h-12 w-full rounded-2xl border border-border bg-card pl-5 pr-12 text-sm text-text.primary placeholder:text-text.secondary/60 outline-none transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
            />
            <Button type="submit" variant="primary" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 shadow-brand hover:shadow-brand-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </Button>
          </form>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Button
              variant={showFilters ? "primary" : "secondary"}
              size="sm"
              onClick={() => setShowFilters((o) => !o)}
              className="shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="8" cy="6" r="1.5" fill="currentColor"/><circle cx="16" cy="12" r="1.5" fill="currentColor"/><circle cx="10" cy="18" r="1.5" fill="currentColor"/></svg>
              Filters
              {activeFilterCount > 0 && <Badge variant="brand" size="sm" className="ml-1.5">{activeFilterCount}</Badge>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters({ availableOnly: true, page: 1 });
                setSearchParams({});
              }}
              className="shrink-0"
            >
              Clear all
            </Button>
          </div>

          {showFilters && (
            <Card variant="strong" padding="md" className="border border-border/60 animate-slideUp">
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Room type</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {roomTypes.map((r) => (
                      <button
                        key={r}
                        onClick={() => setFilters((f) => ({ ...f, roomType: f.roomType === r ? undefined : r, page: 1 }))}
                        className={`h-9 rounded-full border px-3.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${filters.roomType === r ? "border-primary-500 bg-primary-600/10 text-primary-700 shadow-sm" : "border-border bg-card text-text.secondary hover:border-primary-200"}`}
                      >
                        {r.replace(/_/g, " ").toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Gender</p>
                  <div className="mt-2 flex gap-2">
                    {genders.map((g) => (
                      <button
                        key={g}
                        onClick={() => setFilters((f) => ({ ...f, gender: f.gender === g ? undefined : g, page: 1 }))}
                        className={`h-9 rounded-full border px-3.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${filters.gender === g ? "border-primary-500 bg-primary-600/10 text-primary-700 shadow-sm" : "border-border bg-card text-text.secondary hover:border-primary-200"}`}
                      >
                        {g.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Max distance (km)</p>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={0.5}
                    value={filters.maxDistanceKm ?? 20}
                    onChange={(e) => setFilters((f) => ({ ...f, maxDistanceKm: Number(e.target.value), page: 1 }))}
                    className="mt-2 w-full accent-primary-600"
                  />
                  <p className="mt-1 text-xs text-text.secondary">{(filters.maxDistanceKm ?? 20)}km or less</p>
                </div>

                {amenities.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Amenities</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {amenities.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => {
                            const current = filters.amenityIds ?? [];
                            const next = current.includes(a.id) ? current.filter((x) => x !== a.id) : [...current, a.id];
                            setFilters((f) => ({ ...f, amenityIds: next.length ? next : undefined, page: 1 }));
                          }}
                          className={`h-9 rounded-full border px-3.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${filters.amenityIds?.includes(a.id) ? "border-primary-500 bg-primary-600/10 text-primary-700 shadow-sm" : "border-border bg-card text-text.secondary hover:border-primary-200"}`}
                        >
                          {a.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}
        </section>

        {recentSearches.length > 0 && !isLoading && (
          <section className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Recent searches</p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search) => (
                <button
                  key={search.label}
                  onClick={() => handleRecentSearch(search.query)}
                   className="h-9 rounded-full border border-border bg-card px-3.5 text-xs font-medium text-text.secondary transition-all duration-200 hover:border-primary-200 hover:shadow-sm active:scale-95"
                >
                  {search.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          )}

          {isError && (
            <Card variant="outlined" padding="lg">
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-error"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                }
                title="Couldn't load listings"
                description="Something went wrong while fetching properties. Please check your connection and try again."
                actionLabel="Retry"
                onAction={() => queryClient.invalidateQueries({ queryKey: ["properties"] })}
              />
            </Card>
          )}

          {data && data.items.length === 0 && (
            <Card variant="outlined" padding="lg">
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                }
                title="No listings match your filters"
                description="Try widening your search or adjusting your filters to see more properties."
                actionLabel="Clear filters"
                onAction={() => {
                  setFilters({ availableOnly: true, page: 1 });
                  setSearchParams({});
                }}
              />
            </Card>
          )}

          {!isLoading && !isError && data && data.items.length > 0 && (
            <div className="space-y-4">
              {data.items.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  isFavourited={favouriteIds.has(property.id)}
                  onToggleFavourite={user?.role === "STUDENT" ? handleToggleFavourite : undefined}
                />
              ))}
            </div>
          )}

          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 pb-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilters((f) => ({ ...f, page: p }))}
                   className={`h-11 w-11 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 ${p === filters.page ? "bg-primary-700 text-white shadow-brand" : "bg-card text-text.secondary hover:bg-cream-100 border border-border"}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </StudentMobileShell>
  );
}

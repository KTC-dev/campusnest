import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyFiltersBar } from "@/components/PropertyFiltersBar";
import { propertyService } from "@/services/property.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { Gender, PropertyFilters, RoomType } from "@/types";
import { getFriendlyErrorMessage } from "@/utils/error";

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

export default function PropertyListingPage() {
  const [searchParams] = useSearchParams();
  // Seeds filters from the landing page's hero search (?maxPrice=&roomType=&gender=)
  // on first render only — the filters bar takes over from there.
  const [filters, setFilters] = useState<PropertyFilters>(() => filtersFromSearchParams(searchParams));
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

  return (
    <StudentMobileShell>
      <div className="page-transition space-y-4">
        <section className="mobile-card-compact p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Browse</p>
          <h1 className="mt-1 text-2xl font-display font-bold text-slate-800">Find your place</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data ? `${data.total} verified listing${data.total === 1 ? "" : "s"} near FUO` : "Loading listings…"}
          </p>
        </section>

        <section className="space-y-4">
          <PropertyFiltersBar filters={filters} amenities={amenities} onChange={setFilters} />

          {isLoading && (
            <div className="mobile-card-compact p-4 text-sm text-slate-600">Applying filters and loading listings…</div>
          )}
          {isError && <p className="px-1 text-sm text-red-600">Couldn't load listings. Please try again.</p>}

          {data && data.items.length === 0 && (
            <div className="mobile-card-compact p-6 text-center text-slate-500">
              No listings match your filters yet. Try widening your search.
            </div>
          )}

          <div className="space-y-4">
            {data?.items.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavourited={favouriteIds.has(property.id)}
                onToggleFavourite={user?.role === "STUDENT" ? handleToggleFavourite : undefined}
              />
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 pb-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilters((f) => ({ ...f, page: p }))}
                  className={`h-10 w-10 rounded-full text-sm font-medium transition ${p === filters.page ? "bg-brand-900 text-white shadow-soft" : "bg-white text-slate-600 hover:bg-cream-100"}`}
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

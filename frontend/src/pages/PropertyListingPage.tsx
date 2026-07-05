import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppNav } from "@/components/AppNav";
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
    <div className="min-h-screen bg-slate-50">
      <AppNav />

      <main className="px-6 py-8 md:px-12">
        <h1 className="text-2xl font-bold text-brand-900">Find your place</h1>
        <p className="mt-1 text-sm text-slate-500">
          {data ? `${data.total} verified listing${data.total === 1 ? "" : "s"} near FUO` : "Loading listings…"}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
          <PropertyFiltersBar filters={filters} amenities={amenities} onChange={setFilters} />

          <div>
            {isLoading && (
              <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                Applying filters and loading listings…
              </div>
            )}
            {isError && <p className="text-sm text-red-600">Couldn't load listings. Please try again.</p>}

            {data && data.items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                No listings match your filters yet. Try widening your search.
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
              <div className="mt-6 flex justify-center gap-2">
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters((f) => ({ ...f, page: p }))}
                    className={`h-8 w-8 rounded-full text-sm font-medium ${p === filters.page ? "bg-brand-500 text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

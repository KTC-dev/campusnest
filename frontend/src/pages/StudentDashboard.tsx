import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AppNav } from "@/components/AppNav";
import { PropertyCard } from "@/components/PropertyCard";
import { propertyService } from "@/services/property.service";
import { useAuthStore } from "@/store/authStore";

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: favourites = [], isLoading } = useQuery({
    queryKey: ["favourites"],
    queryFn: propertyService.listFavourites,
  });

  async function handleToggleFavourite(id: string) {
    await propertyService.toggleFavourite(id);
    queryClient.invalidateQueries({ queryKey: ["favourites"] });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav />

      <main className="px-6 py-8 md:px-12 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-brand-900">Welcome back{user ? `, ${user.email.split("@")[0]}` : ""}</h1>
        <p className="mt-1 text-sm text-slate-500">Your saved listings. Booking status lands in Phase 3.</p>

        <div className="mt-6 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Favourites</h2>
          <Link to="/properties" className="text-sm font-medium text-brand-600 hover:underline">
            Browse more listings →
          </Link>
        </div>

        {isLoading && <p className="mt-4 text-sm text-slate-500">Loading…</p>}

        {!isLoading && favourites.length === 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No saved listings yet. Tap the heart on any property to save it here.
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {favourites.map((property) => (
            <PropertyCard key={property.id} property={property} isFavourited onToggleFavourite={handleToggleFavourite} />
          ))}
        </div>
      </main>
    </div>
  );
}

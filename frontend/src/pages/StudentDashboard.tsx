import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AppNav } from "@/components/AppNav";
import { PropertyCard } from "@/components/PropertyCard";
import { propertyService } from "@/services/property.service";
import { bookingService } from "@/services/booking.service";
import { useAuthStore } from "@/store/authStore";
import { BookingStatus } from "@/types";

const statusStyles: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-200 text-slate-600",
  COMPLETED: "bg-brand-100 text-brand-700",
};

export default function StudentDashboard() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: favourites = [], isLoading: loadingFavourites } = useQuery({
    queryKey: ["favourites"],
    queryFn: propertyService.listFavourites,
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: bookingService.listMine,
  });

  async function handleToggleFavourite(id: string) {
    await propertyService.toggleFavourite(id);
    queryClient.invalidateQueries({ queryKey: ["favourites"] });
  }

  async function handleCancel(id: string) {
    await bookingService.cancel(id);
    queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav />

      <main className="px-6 py-8 md:px-12 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-brand-900">Welcome back{user ? `, ${user.email.split("@")[0]}` : ""}</h1>
        <p className="mt-1 text-sm text-slate-500">Track your booking requests and saved listings.</p>

        <section className="mt-6">
          <h2 className="font-semibold text-slate-900">Your booking requests</h2>
          {loadingBookings && <p className="mt-2 text-sm text-slate-500">Loading…</p>}
          {!loadingBookings && bookings.length === 0 && (
            <p className="mt-2 text-sm text-slate-500">No booking requests yet.</p>
          )}
          <div className="mt-3 space-y-2">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{booking.property.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Move-in: {new Date(booking.moveInDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[booking.status]}`}>
                  {booking.status.toLowerCase()}
                </span>
                {booking.status === "PENDING" && (
                  <button onClick={() => handleCancel(booking.id)} className="text-xs font-medium text-red-500 hover:underline">
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Favourites</h2>
            <Link to="/properties" className="text-sm font-medium text-brand-600 hover:underline">
              Browse more listings →
            </Link>
          </div>

          {loadingFavourites && <p className="mt-4 text-sm text-slate-500">Loading…</p>}

          {!loadingFavourites && favourites.length === 0 && (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No saved listings yet. Tap the heart on any property to save it here.
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {favourites.map((property) => (
              <PropertyCard key={property.id} property={property} isFavourited onToggleFavourite={handleToggleFavourite} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

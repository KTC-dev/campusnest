import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { PropertyCard } from "@/components/PropertyCard";
import { propertyService } from "@/services/property.service";
import { bookingService } from "@/services/booking.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/authStore";
import { BookingStatus, Property, PropertyListResult } from "@/types";

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

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: userService.getMe,
    enabled: Boolean(user),
  });

  const { data: favourites = [], isLoading: loadingFavourites } = useQuery({
    queryKey: ["favourites"],
    queryFn: propertyService.listFavourites,
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: bookingService.listMine,
  });

  const { data: featuredProperties, isLoading: loadingFeatured } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: () => propertyService.list({ availableOnly: true, page: 1 }) as Promise<PropertyListResult>,
  });

  const featuredVerified: Property[] =
    featuredProperties?.items?.filter((property) => property.status === "APPROVED" && property.landlord?.isVerified).slice(0, 3) ?? [];

  const firstName = profile?.student?.firstName || profile?.landlord?.firstName || user?.email.split("@")[0] || "there";
  const bookingCount = bookings.length;
  const savedCount = favourites.length;
  const featuredCount = featuredVerified.length;

  async function handleToggleFavourite(id: string) {
    await propertyService.toggleFavourite(id);
    queryClient.invalidateQueries({ queryKey: ["favourites"] });
  }

  async function handleCancel(id: string) {
    await bookingService.cancel(id);
    queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
  }

  return (
    <StudentMobileShell>
      <div className="page-transition space-y-4">
        <section className="mobile-card overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(212,160,23,0.16),_transparent_36%),linear-gradient(160deg,_#14532d_0%,_#1f2937_100%)] p-5 text-white shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cream-100/80">CampusNest</p>
              <h1 className="mt-2 text-[28px] font-display font-bold leading-tight">Welcome back, {firstName}.</h1>
              <p className="mt-2 max-w-[26ch] text-sm text-cream-100/90">
                Your bookings, saved places, and best verified options are all in one calm, mobile-first space.
              </p>
            </div>
            <div className="rounded-[18px] bg-white/10 px-3 py-2 text-right text-xs backdrop-blur-sm">
              <p className="text-cream-100/70">Today</p>
              <p className="mt-0.5 font-semibold text-white">Student hub</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-[18px] bg-white/10 p-3">
              <p className="text-[11px] text-cream-100/80">Bookings</p>
              <p className="mt-1 text-2xl font-bold text-white">{bookingCount}</p>
            </div>
            <div className="rounded-[18px] bg-white/10 p-3">
              <p className="text-[11px] text-cream-100/80">Saved</p>
              <p className="mt-1 text-2xl font-bold text-white">{savedCount}</p>
            </div>
            <div className="rounded-[18px] bg-white/10 p-3">
              <p className="text-[11px] text-cream-100/80">Verified</p>
              <p className="mt-1 text-2xl font-bold text-white">{featuredCount}</p>
            </div>
          </div>
        </section>

        <section className="mobile-card-compact p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Quick stats</p>
              <h2 className="mt-1 text-lg font-display font-bold text-slate-800">Track what matters</h2>
            </div>
            <Link to="/properties" className="text-sm font-semibold text-brand-900">
              Browse →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-[18px] bg-cream-50 p-4">
              <p className="text-xs text-slate-500">Bookings</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{bookingCount}</p>
              <p className="mt-1 text-xs text-slate-500">Requests and updates</p>
            </div>
            <div className="rounded-[18px] bg-cream-50 p-4">
              <p className="text-xs text-slate-500">Saved listings</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{savedCount}</p>
              <p className="mt-1 text-xs text-slate-500">Ready to revisit</p>
            </div>
          </div>
        </section>

        <section className="space-y-3" id="saved-listings">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Saved listings</p>
              <h2 className="mt-1 text-lg font-display font-bold text-slate-800">Your favourites</h2>
            </div>
            <Link to="/properties" className="text-sm font-semibold text-brand-900">
              More →
            </Link>
          </div>

          {loadingFavourites && <p className="px-1 text-sm text-slate-500">Loading…</p>}

          {!loadingFavourites && favourites.length === 0 && (
            <div className="mobile-card-compact p-5 text-center text-slate-500">
              No saved listings yet. Tap the heart on any property to keep it here.
            </div>
          )}

          <div className="space-y-4">
            {favourites.map((property) => (
              <PropertyCard key={property.id} property={property} isFavourited onToggleFavourite={handleToggleFavourite} />
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Booking requests</p>
              <h2 className="mt-1 text-lg font-display font-bold text-slate-800">Recent status</h2>
            </div>
          </div>

          {loadingBookings && <p className="px-1 text-sm text-slate-500">Loading…</p>}
          {!loadingBookings && bookings.length === 0 && (
            <div className="mobile-card-compact p-5 text-center text-slate-500">No booking requests yet.</div>
          )}

          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="mobile-card-compact flex items-start gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 line-clamp-1">{booking.property.title}</p>
                  <p className="mt-1 text-xs text-slate-500">Move-in {new Date(booking.moveInDate).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyles[booking.status]}`}>
                    {booking.status.toLowerCase()}
                  </span>
                  {booking.status === "PENDING" && (
                    <button onClick={() => handleCancel(booking.id)} className="text-xs font-semibold text-terracotta-400">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Featured verified</p>
              <h2 className="mt-1 text-lg font-display font-bold text-slate-800">Top properties near campus</h2>
            </div>
            <Link to="/properties" className="text-sm font-semibold text-brand-900">
              View all →
            </Link>
          </div>

          {loadingFeatured && <p className="px-1 text-sm text-slate-500">Loading featured properties…</p>}

          {!loadingFeatured && featuredVerified.length === 0 && (
            <div className="mobile-card-compact p-5 text-center text-slate-500">
              No featured verified properties yet.
            </div>
          )}

          <div className="space-y-4">
            {featuredVerified.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      </div>
    </StudentMobileShell>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { LandlordMobileShell } from "@/components/LandlordMobileShell";
import { bookingService } from "@/services/booking.service";
import { propertyService } from "@/services/property.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/authStore";

export default function LandlordDashboard() {
  const user = useAuthStore((state) => state.user);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: userService.getMe,
    enabled: Boolean(user),
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["my-properties"],
    queryFn: propertyService.listMine,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["landlord-bookings"],
    queryFn: bookingService.listForLandlord,
  });

  const pendingBookings = bookings.filter((booking) => booking.status === "PENDING");
  const activeListings = properties.filter((property) => property.status === "APPROVED" && property.isAvailable).length;
  const propertyViews = properties.reduce((total, property) => total + (property._count?.bookings ?? 0), 0);
  const inspectionRequests = new Set(pendingBookings.map((booking) => booking.property.title)).size;

  return (
    <LandlordMobileShell>
      <div className="page-transition space-y-4">
        <section className="mobile-card overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(212,160,23,0.16),_transparent_36%),linear-gradient(160deg,_#14532d_0%,_#1f2937_100%)] p-5 text-white shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cream-100/80">Landlord hub</p>
          <h1 className="mt-2 text-[28px] font-display font-bold leading-tight">
            Welcome back, {profile?.landlord?.firstName || user?.email.split("@")[0] || "there"}.
          </h1>
          <p className="mt-2 max-w-[26ch] text-sm text-cream-100/90">
            Manage bookings, track occupancy, and keep every listing looking polished on mobile.
          </p>
        </section>

        <section className="mobile-card-compact p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[18px] bg-cream-50 p-4">
              <p className="text-xs text-slate-500">Active Listings</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{activeListings}</p>
            </div>
            <div className="rounded-[18px] bg-cream-50 p-4">
              <p className="text-xs text-slate-500">New Inquiries</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{pendingBookings.length}</p>
            </div>
            <div className="rounded-[18px] bg-cream-50 p-4">
              <p className="text-xs text-slate-500">Property Views</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{propertyViews}</p>
            </div>
            <div className="rounded-[18px] bg-cream-50 p-4">
              <p className="text-xs text-slate-500">Inspection Requests</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{inspectionRequests}</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Actions</p>
              <h2 className="mt-1 text-lg font-display font-bold text-slate-800">Quick access</h2>
            </div>
            <Link to="/dashboard/listings/new" className="text-sm font-semibold text-brand-900">
              Add listing →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/dashboard/properties" className="rounded-[18px] bg-brand-900 px-4 py-4 text-sm font-semibold text-white shadow-soft transition active:scale-95">
              My properties
            </Link>
            <Link to="/dashboard/listings/new" className="rounded-[18px] bg-white px-4 py-4 text-sm font-semibold text-slate-800 shadow-sm transition active:scale-95">
              Add property
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">New inquiries</p>
              <h2 className="mt-1 text-lg font-display font-bold text-slate-800">Recent requests</h2>
            </div>
          </div>

          {isLoading && <p className="px-1 text-sm text-slate-500">Loading…</p>}

          {!isLoading && pendingBookings.length === 0 && (
            <div className="mobile-card-compact p-5 text-center text-slate-500">No new inquiries yet.</div>
          )}

          <div className="space-y-3">
            {pendingBookings.slice(0, 3).map((booking) => (
              <div key={booking.id} className="mobile-card-compact p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{booking.property.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {booking.student?.firstName} {booking.student?.lastName} · {new Date(booking.moveInDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                    Pending
                  </span>
                </div>
                {booking.message && <p className="mt-3 text-sm text-slate-600">{booking.message}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </LandlordMobileShell>
  );
}

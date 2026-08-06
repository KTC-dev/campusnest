import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { LandlordMobileShell } from "@/components/LandlordMobileShell";
import { bookingService } from "@/services/booking.service";
import { propertyService } from "@/services/property.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

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
    enabled: Boolean(user),
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["landlord-bookings"],
    queryFn: bookingService.listForLandlord,
    enabled: Boolean(user),
  });

  const pendingBookings = bookings.filter((booking) => booking.status === "PENDING");
  const activeListings = properties.filter((property) => property.status === "APPROVED" && property.isAvailable).length;
  const propertyViews = properties.reduce((total, property) => total + (property._count?.bookings ?? 0), 0);
  const inspectionRequests = new Set(pendingBookings.map((booking) => booking.property.title)).size;

  return (
    <LandlordMobileShell>
      <div className="page-enter space-y-5">
        <section className="overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top_right,_rgba(109,40,217,0.08),_transparent_36%),linear-gradient(160deg,_#3b0764_0%,_#1e0a3c_100%)] p-5 text-white shadow-soft">          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cream-100/80">Landlord hub</p>
          <h1 className="mt-2 text-[28px] font-display font-bold leading-tight">
            Welcome back, {profile?.landlord?.firstName || user?.email.split("@")[0] || "there"}.
          </h1>
          <p className="mt-2 max-w-[26ch] text-sm text-cream-100/90">
            Manage bookings, track occupancy, and keep every listing looking polished on mobile.
          </p>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Card variant="elevated" padding="md">
            <p className="text-xs text-text.secondary">Active Listings</p>
            <p className="mt-1 text-2xl font-bold text-text.primary">{activeListings}</p>
          </Card>
          <Card variant="elevated" padding="md">
            <p className="text-xs text-text.secondary">New Inquiries</p>
            <p className="mt-1 text-2xl font-bold text-text.primary">{pendingBookings.length}</p>
          </Card>
          <Card variant="elevated" padding="md">
            <p className="text-xs text-text.secondary">Property Views</p>
            <p className="mt-1 text-2xl font-bold text-text.primary">{propertyViews}</p>
          </Card>
          <Card variant="elevated" padding="md">
            <p className="text-xs text-text.secondary">Inspection Requests</p>
            <p className="mt-1 text-2xl font-bold text-text.primary">{inspectionRequests}</p>
          </Card>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Actions</p>
              <h2 className="mt-1 text-lg font-display font-bold text-text.primary">Quick access</h2>
            </div>
            <Link to="/dashboard/listings/new" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Add listing →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/dashboard/properties">
              <Button variant="primary" size="md" fullWidth>
                My properties
              </Button>
            </Link>
            <Link to="/dashboard/listings/new">
              <Button variant="secondary" size="md" fullWidth>
                Add property
              </Button>
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">New inquiries</p>
              <h2 className="mt-1 text-lg font-display font-bold text-text.primary">Recent requests</h2>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-3">
              <div className="h-20 w-full animate-pulse rounded-card bg-cream-100" />
              <div className="h-20 w-full animate-pulse rounded-card bg-cream-100" />
            </div>
          )}

          {!isLoading && pendingBookings.length === 0 && (
            <Card variant="outlined" padding="lg">
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                }
                title="No new inquiries yet"
                description="When students request inspections, they'll appear here."
              />
            </Card>
          )}

          <div className="space-y-3">
            {pendingBookings.slice(0, 3).map((booking) => (
              <Card key={booking.id} variant="outlined" padding="md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text.primary">{booking.property.title}</p>
                    <p className="mt-1 text-xs text-text.secondary">
                      {booking.student?.firstName} {booking.student?.lastName} · {new Date(booking.moveInDate).toLocaleDateString()}
                    </p>
                    {booking.message && <p className="mt-2 text-sm text-text.secondary line-clamp-2">{booking.message}</p>}
                  </div>
                  <Badge variant="warning" size="sm">Pending</Badge>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </LandlordMobileShell>
  );
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { PropertyCard } from "@/components/PropertyCard";
import { propertyService } from "@/services/property.service";
import { bookingService } from "@/services/booking.service";
import { reviewService } from "@/services/review.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PropertyCardSkeleton } from "@/components/ui/LoadingState";
import type { PropertyListResult } from "@/types";

const statusTone: Record<string, "success" | "warning" | "error" | "neutral"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  CANCELLED: "neutral",
  COMPLETED: "success",
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
    enabled: Boolean(user),
  });

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: bookingService.listMine,
    enabled: Boolean(user),
  });

  const { data: myReview, isLoading: loadingMyReview } = useQuery({
    queryKey: ["my-review"],
    queryFn: reviewService.getMyReview,
    enabled: Boolean(user),
  });

  const { data: featuredProperties, isLoading: loadingFeatured } = useQuery({
    queryKey: ["featured-properties"],
    queryFn: () => propertyService.list({ availableOnly: true, page: 1 }) as Promise<PropertyListResult>,
  });

  const featuredVerified = featuredProperties?.items?.filter((property) => property.status === "APPROVED" && property.agent?.isVerified).slice(0, 3) ?? [];

  const firstName = profile?.student?.firstName || profile?.agent?.firstName || user?.email.split("@")[0] || "there";
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
      <div className="page-enter space-y-5">
        <section className="overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top_right,_rgba(109,40,217,0.08),_transparent_36%),linear-gradient(160deg,_#3b0764_0%,_#1e0a3c_100%)] p-5 text-white shadow-soft">          <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cream-100/80">Edurus</p>
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
              <div className="rounded-card border border-white/10 bg-white/10 p-4 text-center">
                <p className="text-[11px] text-cream-100/80">Bookings</p>
                <p className="mt-1 text-2xl font-bold text-white">{bookingCount}</p>
              </div>
              <div className="rounded-card border border-white/10 bg-white/10 p-4 text-center">
                <p className="text-[11px] text-cream-100/80">Saved</p>
                <p className="mt-1 text-2xl font-bold text-white">{savedCount}</p>
              </div>
              <div className="rounded-card border border-white/10 bg-white/10 p-4 text-center">
                <p className="text-[11px] text-cream-100/80">Verified</p>
                <p className="mt-1 text-2xl font-bold text-white">{featuredCount}</p>
              </div>
            </div>
          </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Quick actions</p>
              <h2 className="mt-1 text-lg font-display font-bold text-text.primary">Get started</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Link to="/accommodation-requests/new">
              <Button variant="primary" size="md" fullWidth>
                Post request
              </Button>
            </Link>
          </div>
        </section>
        <Card variant="strong" padding="md" className="border border-border/60">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Quick stats</p>
              <h2 className="mt-1 text-lg font-display font-bold text-text.primary">Track what matters</h2>
            </div>
            <Link to="/properties" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Browse →
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Card variant="strong" padding="md" className="shadow-soft">
              <p className="text-xs text-text.secondary">Bookings</p>
              <p className="mt-1 text-2xl font-bold text-text.primary">{bookingCount}</p>
              <p className="mt-1 text-xs text-text.secondary">Requests and updates</p>
            </Card>
            <Card variant="strong" padding="md" className="shadow-soft">
              <p className="text-xs text-text.secondary">Saved listings</p>
              <p className="mt-1 text-2xl font-bold text-text.primary">{savedCount}</p>
              <p className="mt-1 text-xs text-text.secondary">Ready to revisit</p>
            </Card>
          </div>
        </Card>

        <section className="space-y-4" id="saved-listings">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Saved listings</p>
              <h2 className="mt-1 text-lg font-display font-bold text-text.primary">Your favourites</h2>
            </div>
            <Link to="/properties" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              More →
            </Link>
          </div>

          {loadingFavourites && (
            <div className="space-y-4">
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </div>
          )}

          {!loadingFavourites && favourites.length === 0 && (
            <Card variant="outlined" padding="lg" className="border border-border/60">
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                }
                title="No saved listings yet"
                description="Tap the heart on any property to keep it here for easy access."
              />
            </Card>
          )}

          <div className="space-y-4">
            {favourites.map((property) => (
              <PropertyCard key={property.id} property={property} isFavourited onToggleFavourite={handleToggleFavourite} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Booking requests</p>
              <h2 className="mt-1 text-lg font-display font-bold text-text.primary">Recent status</h2>
            </div>
          </div>

          {loadingBookings && (
            <div className="space-y-3">
              <div className="h-20 w-full animate-pulse rounded-card bg-cream-100" />
              <div className="h-20 w-full animate-pulse rounded-card bg-cream-100" />
            </div>
          )}

          {!loadingBookings && bookings.length === 0 && (
            <Card variant="outlined" padding="lg" className="border border-border/60">
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                }
                title="No booking requests yet"
                description="When you request an inspection, it will appear here with status updates."
              />
            </Card>
          )}

          <div className="space-y-3">
            {bookings.map((booking) => (
              <Card key={booking.id} variant="outlined" padding="md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text.primary">{booking.property.title}</p>
                    <p className="mt-1 text-xs text-text.secondary">Move-in {new Date(booking.moveInDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={statusTone[booking.status] ?? "neutral"} size="sm">{booking.status.toLowerCase()}</Badge>
                    {booking.status === "PENDING" && (
                      <Button variant="ghost" size="sm" onClick={() => handleCancel(booking.id)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Reviews</p>
              <h2 className="mt-1 text-lg font-display font-bold text-text.primary">Rate your stay</h2>
            </div>
          </div>

          {loadingMyReview ? (
            <div className="space-y-3">
              <div className="h-20 w-full animate-pulse rounded-card bg-cream-100" />
            </div>
          ) : myReview ? (
            <Card variant="outlined" padding="md" className="border border-border/60">
              <p className="text-sm font-semibold text-text.primary">Your review</p>
              <p className="mt-1 text-xs text-text.secondary">You reviewed {myReview.property?.title ?? "this property"} — {myReview.rating}/5</p>
              {myReview.comment && (
                <p className="mt-2 text-sm text-text.secondary">{myReview.comment}</p>
              )}
            </Card>
          ) : bookings.some((b) => b.status === "COMPLETED") ? (
            <Card variant="outlined" padding="md" className="border border-border/60">
              <p className="text-sm font-semibold text-text.primary">How was your stay?</p>
              <p className="mt-1 text-xs text-text.secondary">You have a completed booking. Share your experience to help other students.</p>
              <div className="mt-3 flex gap-2">
                <Link to="/accommodation-requests">
                  <Button variant="primary" size="sm">View bookings</Button>
                </Link>
                <Link to="/properties">
                  <Button variant="secondary" size="sm">Browse properties</Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card variant="outlined" padding="md" className="border border-border/60">
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                }
                title="No reviews yet"
                description="Complete a booking to leave a review and help fellow students."
              />
            </Card>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Featured verified</p>
              <h2 className="mt-1 text-lg font-display font-bold text-text.primary">Top properties near campus</h2>
            </div>
            <Link to="/properties" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              View all →
            </Link>
          </div>

          {loadingFeatured && (
            <div className="space-y-4">
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </div>
          )}

          {!loadingFeatured && featuredVerified.length === 0 && (
            <Card variant="outlined" padding="lg" className="border border-border/60">
              <EmptyState
                icon={
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                }
                title="No featured verified properties yet"
                description="Check back soon — we surface the best verified listings here."
              />
            </Card>
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


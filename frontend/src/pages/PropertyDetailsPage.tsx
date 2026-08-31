import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AgentMobileShell } from "@/components/AgentMobileShell";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { BookingRequestModal } from "@/components/BookingRequestModal";
import { propertyService } from "@/services/property.service";
import { conversationService } from "@/services/conversation.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { getFriendlyErrorMessage } from "@/utils/error";
import { Badge } from "@/components/ui/Badge";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { LocationPicker } from "@/components/LocationPicker";
import { ReviewList } from "@/components/ReviewList";
import { ReviewForm } from "@/components/ReviewForm";

interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

function formatNaira(price: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    Number(price)
  );
}

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<PropertyImage | null>(null);
  const [bookingSent, setBookingSent] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);
  const Shell = user?.role === "AGENT" ? AgentMobileShell : StudentMobileShell;

  const { data: property, isLoading, isError } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyService.getById(id!),
    enabled: Boolean(id),
  });
  useEffect(() => {
    if (property?.images?.length) {
      setSelectedImage(property.images.find((i) => i.isPrimary) ?? property.images[0]);
    }
  }, [property]);

  async function handleContactAgent() {
    if (!id || !user || user?.role !== "STUDENT" || isCreatingConversation || !property?.agent) return;

    setIsCreatingConversation(true);
    try {
      const conversation = await conversationService.create({ propertyId: id, initialMessage: "Hello, I'm interested in your property." });
      navigate(`/conversations/${conversation.id}`);
    } catch (error: any) {
      addToast({ type: "error", title: "Unable to contact agent", message: getFriendlyErrorMessage(error) });
    } finally {
      setIsCreatingConversation(false);
    }
  }

  if (isLoading) {
    return (
      <Shell>
        <div className="space-y-4 p-4">
          <Skeleton variant="rectangle" className="h-64 w-full rounded-[24px]" />
          <Skeleton variant="text" className="h-8 w-3/4" />
          <Skeleton variant="text" className="h-5 w-1/2" />
          <div className="flex gap-3">
            <Skeleton variant="rectangle" className="h-20 flex-1 rounded-2xl" />
            <Skeleton variant="rectangle" className="h-20 flex-1 rounded-2xl" />
          </div>
        </div>
      </Shell>
    );
  }

  if (isError || !property) {
    return (
      <Shell>
        <div className="p-4">
          <Card variant="outlined" padding="lg">
            <EmptyState
              icon={
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-error"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              }
              title="Listing not found"
              description="This property may have been removed or is no longer available."
              actionLabel="Browse properties"
              onAction={() => navigate("/properties")}
            />
          </Card>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="page-enter grid grid-cols-1 gap-6 pb-28">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-[24px] bg-slate-100 shadow-soft-lg">
            <img
              src={selectedImage?.url ?? property.images.find((i) => i.isPrimary)?.url ?? property.images[0]?.url ?? ""}
              alt={property.title}
              className="h-72 w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
            <div className="absolute left-4 top-4">
              <Badge variant="brand" size="md">{property.genderRestriction === "ANY" ? "Any gender" : property.genderRestriction.toLowerCase()}</Badge>
            </div>
            {!property.isAvailable && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                <Badge variant="error" size="md">Fully booked</Badge>
              </div>
            )}
          </div>

          {property.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {property.images.map((image) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className={`h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${selectedImage?.id === image.id || (!selectedImage && image.isPrimary)
                    ? "border-brand-900 opacity-100"
                    : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                >
                  <img src={image.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5 px-1">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text.primary">{property.title}</h1>
            <p className="mt-1 text-sm text-text.secondary">{property.location}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Card variant="outlined" padding="sm" className="flex items-center gap-2.5">
              <span className="text-lg">🏠</span>
              <div>
                <p className="text-xs text-text.secondary">Bedrooms</p>
                <p className="text-sm font-semibold text-text.primary">{property.bedrooms}</p>
              </div>
            </Card>
            <Card variant="outlined" padding="sm" className="flex items-center gap-2.5">
              <span className="text-lg">🚿</span>
              <div>
                <p className="text-xs text-text.secondary">Bathrooms</p>
                <p className="text-sm font-semibold text-text.primary">{property.bathrooms}</p>
              </div>
            </Card>
            <Card variant="outlined" padding="sm" className="flex items-center gap-2.5">
              <span className="text-lg">📍</span>
              <div>
                <p className="text-xs text-text.secondary">Distance</p>
                <p className="text-sm font-semibold text-text.primary">{Number(property.distanceFromCampusKm)}km</p>
              </div>
            </Card>
          </div>

          <Card variant="elevated" padding="md">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text.secondary">About this property</p>
            <p className="mt-2 text-sm leading-7 text-text.primary whitespace-pre-line">{property.description}</p>
          </Card>

          {property.amenities.length > 0 && (
            <Card variant="strong" padding="md" className="border border-border/60">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text.secondary">Amenities</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map(({ amenity }) => (
                  <span key={amenity.id} className="rounded-full border border-border bg-cream-50 px-3 py-1.5 text-xs font-medium text-text.primary">
                    {amenity.name}
                  </span>
                ))}
              </div>
            </Card>
          )}
          {(property.latitude && property.longitude) && (
            <Card variant="outlined" padding="md">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text.secondary mb-3">Location</p>
              <LocationPicker
                latitude={Number(property.latitude)}
                longitude={Number(property.longitude)}
                formattedAddress={property.formattedAddress ?? undefined}
                placeId={property.placeId ?? undefined}
                onChange={() => {}}
                readOnly
              />
              {property.formattedAddress && (
                <p className="mt-2 text-xs text-text.secondary">?? {property.formattedAddress}</p>
              )}
            </Card>
          )}
          {property.agent && (
            <Card variant="strong" padding="md" className="border border-border/60">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-lg font-semibold text-brand-700">
                  {property.agent.businessName?.[0] ?? property.agent.firstName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text.primary truncate">
                    {property.agent.businessName || `${property.agent.firstName} ${property.agent.lastName}`}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    {property.agent.isVerified && (
                      <VerifiedBadge size={16} showText />
                    )}
                  </div>
                </div>
              </div>
              {property.agent.isVerified && (
                <p className="mt-2 text-[10px] text-text.secondary">
                  Edurus Verified — identity and documents checked. This does not guarantee safety or ownership.
                </p>
              )}
            </Card>
          )}
          {user?.role === "STUDENT" && (
            <Card variant="outlined" padding="md">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text.secondary mb-3">Write a review</p>
              <ReviewForm propertyId={property.id} />
            </Card>
          )}
          <Card variant="elevated" padding="md">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-text.secondary mb-3">Reviews</p>
            <ReviewList propertyId={property.id} />
          </Card>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-white/90 px-4 py-3 backdrop-blur-xl" style={{ paddingBottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}>        <div className="mx-auto max-w-md space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-text.secondary">Price per year</p>
            <p className="font-display text-2xl font-semibold text-text.primary">
              {formatNaira(property.price)} <span className="text-sm font-normal text-text.secondary">/ year</span>
            </p>
          </div>
          {property.isAvailable && (
            <Badge variant="success" size="sm">Available</Badge>
          )}
        </div>

        {user ? (
          user.role === "STUDENT" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={handleContactAgent}
                disabled={isCreatingConversation || !property.agent}
                loading={isCreatingConversation}
              >
                {isCreatingConversation ? "Opening chat…" : "Contact Agent"}
              </Button>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="shadow-brand hover:shadow-brand-lg"
                onClick={() => setShowBookingModal(true)}
                disabled={!property.isAvailable || bookingSent}
              >
                {bookingSent ? "Request sent ✓" : property.isAvailable ? "Request Inspection" : "Fully booked"}
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-cream-50 px-4 py-3 text-center">
              <p className="text-sm text-text.secondary">
                {user.role === "AGENT" && "Available for agents only"}
                {user.role === "ADMIN" && "Available for admins only"}
              </p>
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-border bg-cream-50 px-4 py-3 text-center">
            <p className="text-sm text-text.secondary">Log in to contact the agent or request inspection</p>
          </div>
        )}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
      </div>

      {showBookingModal && (
        <BookingRequestModal
          propertyId={property.id}
          propertyTitle={property.title}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            setBookingSent(true);
            addToast({ type: "success", title: "Inspection request sent", message: "The agent will contact you soon." });
          }}
        />
      )}
    </Shell>
  );
}


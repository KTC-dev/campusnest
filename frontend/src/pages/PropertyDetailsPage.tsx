import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LandlordMobileShell } from "@/components/LandlordMobileShell";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { BookingRequestModal } from "@/components/BookingRequestModal";
import { propertyService } from "@/services/property.service";
import { conversationService } from "@/services/conversation.service";
import { useAuthStore } from "@/store/authStore";

function formatNaira(price: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    Number(price)
  );
}

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSent, setBookingSent] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const user = useAuthStore((s) => s.user);
  const Shell = user?.role === "LANDLORD" ? LandlordMobileShell : StudentMobileShell;

  const { data: property, isLoading, isError } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyService.getById(id!),
    enabled: Boolean(id),
  });

  async function handleContactLandlord() {
    if (!id || !user || user.role !== "STUDENT" || isCreatingConversation) return;

    setIsCreatingConversation(true);
    try {
      const conversation = await conversationService.create({ propertyId: id, initialMessage: "Hello, I would like to know more about this property." });
      navigate(`/conversations/${conversation.id}`);
    } finally {
      setIsCreatingConversation(false);
    }
  }

  if (isLoading) {
    return (
      <Shell>
        <p className="px-1 py-8 text-sm text-slate-500">Loading…</p>
      </Shell>
    );
  }

  if (isError || !property) {
    return (
      <Shell>
        <p className="px-1 py-8 text-sm text-red-600">Listing not found.</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="page-transition grid grid-cols-1 gap-4">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-[20px] bg-slate-100">
            {property.images[activeImage] ? (
              <img src={property.images[activeImage].url} alt={property.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-400">No image</div>
            )}
          </div>
          {property.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {property.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${i === activeImage ? "border-brand-900" : "border-transparent"}`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <h1 className="mt-5 text-2xl font-display font-bold text-slate-800">{property.title}</h1>
          <p className="text-slate-500">{property.location}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>🛏️ {property.bedrooms} bedrooms</span>
            <span>🚿 {property.bathrooms} bathrooms</span>
            <span>📍 {Number(property.distanceFromCampusKm)}km from campus</span>
            <span>👥 {property.genderRestriction === "ANY" ? "Any gender" : property.genderRestriction.toLowerCase()}</span>
          </div>

          <p className="mt-6 whitespace-pre-line leading-relaxed text-slate-700">{property.description}</p>

          {property.amenities.length > 0 && (
              <div className="mt-6">
                <h2 className="font-semibold text-slate-900">Amenities</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {property.amenities.map(({ amenity }) => (
                  <span key={amenity.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                    {amenity.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="mobile-card-compact h-fit p-5">
          <p className="text-2xl font-bold text-brand-900">
            {formatNaira(property.price)} <span className="text-sm font-normal text-slate-400">/ year</span>
          </p>

          {property.landlord && (
            <div className="mt-4 border-t border-slate-100 pt-4 text-sm">
              <p className="font-medium text-slate-900">
                {property.landlord.businessName || `${property.landlord.firstName} ${property.landlord.lastName}`}
              </p>
              <p className="text-slate-500">{property.landlord.isVerified ? "✅ Verified landlord" : "Unverified"}</p>
            </div>
          )}

          <button
            disabled={!property.isAvailable || user?.role !== "STUDENT" || bookingSent}
            onClick={() => setShowBookingModal(true)}
            className="mt-5 w-full rounded-2xl bg-brand-900 py-3 text-sm font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bookingSent ? "Request sent ✓" : property.isAvailable ? "Request to book" : "Fully booked"}
          </button>
          {user?.role === "STUDENT" && (
            <button
              onClick={handleContactLandlord}
              disabled={isCreatingConversation}
              className="mt-3 w-full rounded-2xl border border-brand-200 bg-white py-3 text-sm font-semibold text-brand-700 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreatingConversation ? "Opening chat..." : "Contact landlord"}
            </button>
          )}
          {!user && <p className="mt-2 text-center text-xs text-slate-400">Log in as a student to request a booking.</p>}
          {user && user.role !== "STUDENT" && (
            <p className="mt-2 text-center text-xs text-slate-400">Only students can request bookings.</p>
          )}
        </aside>
      </main>

      {showBookingModal && (
        <BookingRequestModal
          propertyId={property.id}
          propertyTitle={property.title}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false);
            setBookingSent(true);
          }}
        />
      )}
    </Shell>
  );
}

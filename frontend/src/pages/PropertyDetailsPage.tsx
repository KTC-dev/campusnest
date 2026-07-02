import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AppNav } from "@/components/AppNav";
import { BookingRequestModal } from "@/components/BookingRequestModal";
import { propertyService } from "@/services/property.service";
import { useAuthStore } from "@/store/authStore";

function formatNaira(price: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    Number(price)
  );
}

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [activeImage, setActiveImage] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingSent, setBookingSent] = useState(false);
  const user = useAuthStore((s) => s.user);

  const { data: property, isLoading, isError } = useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyService.getById(id!),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <AppNav />
        <p className="px-6 py-10 text-sm text-slate-500 md:px-12">Loading…</p>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen">
        <AppNav />
        <p className="px-6 py-10 text-sm text-red-600 md:px-12">Listing not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav />

      <main className="px-6 py-8 md:px-12 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 max-w-6xl mx-auto">
        <div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100">
            {property.images[activeImage] ? (
              <img src={property.images[activeImage].url} alt={property.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400">No image</div>
            )}
          </div>
          {property.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {property.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 ${
                    i === activeImage ? "border-brand-500" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <h1 className="mt-6 text-2xl font-bold text-brand-900">{property.title}</h1>
          <p className="text-slate-500">{property.location}</p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
            <span>🛏️ {property.bedrooms} bedrooms</span>
            <span>🚿 {property.bathrooms} bathrooms</span>
            <span>📍 {Number(property.distanceFromCampusKm)}km from campus</span>
            <span>👥 {property.genderRestriction === "ANY" ? "Any gender" : property.genderRestriction.toLowerCase()}</span>
          </div>

          <p className="mt-6 text-slate-700 leading-relaxed whitespace-pre-line">{property.description}</p>

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

        <aside className="rounded-2xl border border-slate-100 bg-white p-6 h-fit sticky top-6">
          <p className="text-2xl font-bold text-brand-600">
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
            className="mt-5 w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {bookingSent ? "Request sent ✓" : property.isAvailable ? "Request to book" : "Fully booked"}
          </button>
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
    </div>
  );
}

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LandlordMobileShell } from "@/components/LandlordMobileShell";
import { PropertyGallery } from "@/components/PropertyGallery";
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

  async function handleContactLandlord(message: string = "Hello, I would like to know more about this property.") {
    if (!id || !user || user.role !== "STUDENT" || isCreatingConversation) return;

    setIsCreatingConversation(true);
    try {
      const conversation = await conversationService.create({ propertyId: id, initialMessage: message });
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
       <main className="page-transition grid grid-cols-1 gap-4 pb-24">
         <div>
           <PropertyGallery title={property.title} images={property.images} />

           <h1 className="mt-5 text-2xl font-display font-bold text-slate-800">{property.title}</h1>
           <p className="text-slate-500">{property.location}</p>

           <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
             <span>🏠 {property.bedrooms} bedrooms</span>
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

        {user?.role === "STUDENT" && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-900/10 bg-white/90 backdrop-blur-sm">
            <div className="mx-auto grid max-w-md grid-cols-2 gap-2 p-2">
              <button
                type="button"
                onClick={() => handleContactLandlord("Hello, I'm interested in your property.")}
                disabled={isCreatingConversation || !property.landlord}
                className="rounded-2xl border border-brand-900 bg-white px-4 py-3 text-sm font-semibold text-brand-900 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isCreatingConversation ? "Opening chat..." : "Contact Landlord"}
              </button>
              <button
                type="button"
                onClick={() => setShowBookingModal(true)}
                disabled={!property.isAvailable || bookingSent}
                className="rounded-2xl bg-brand-900 px-4 py-3 text-sm font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bookingSent ? "Request sent ✓" : property.isAvailable ? "Request Inspection" : "Fully booked"}
              </button>
            </div>
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        )}

        {!user && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-900/10 bg-white/90 backdrop-blur-sm p-3 text-center">
            <p className="text-sm text-slate-600">Log in to contact the landlord or request inspection</p>
          </div>
        )}
     </Shell>
   );
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LandlordMobileShell } from "@/components/LandlordMobileShell";
import { LandlordPropertyCard } from "@/components/LandlordPropertyCard";
import { bookingService } from "@/services/booking.service";
import { propertyService } from "@/services/property.service";
import { useAuthStore } from "@/store/authStore";

export default function MyPropertiesPage() {
    const queryClient = useQueryClient();
    const user = useAuthStore((s) => s.user);

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

    async function toggleAvailability(id: string, isAvailable: boolean) {
        await propertyService.update(id, { isAvailable: !isAvailable });
        queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    }

    return (
        <LandlordMobileShell>
            <div className="page-transition space-y-4">
                <section className="mobile-card-compact p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Properties</p>
                    <h1 className="mt-1 text-2xl font-display font-bold text-slate-800">My properties</h1>
                    <p className="mt-2 text-sm text-slate-500">Manage listings, view approvals, and keep availability current.</p>
                </section>

                {isLoading && <p className="px-1 text-sm text-slate-500">Loading properties…</p>}

                {!isLoading && properties.length === 0 && (
                    <div className="mobile-card-compact p-6 text-center text-slate-500">
                        You haven’t listed a property yet. Add your first listing to start getting inquiries.
                    </div>
                )}

                <div className="space-y-4">
                    {properties.map((property) => (
                        <div key={property.id} className="space-y-3">
                            <LandlordPropertyCard property={property} />
                            <div className="flex items-center justify-between gap-3 px-1">
                                <button
                                    onClick={() => toggleAvailability(property.id, property.isAvailable)}
                                    className="rounded-full bg-cream-100 px-4 py-2 text-xs font-semibold text-slate-800 transition active:scale-95"
                                >
                                    {property.isAvailable ? "Mark unavailable" : "Mark available"}
                                </button>
                                <span className="text-xs text-slate-500">{property._count?.bookings ?? 0} inquiries</span>
                            </div>
                        </div>
                    ))}
                </div>

                {bookings.length > 0 && (
                    <div className="mobile-card-compact p-4 text-sm text-slate-600">
                        You have {bookings.filter((booking) => booking.status === "PENDING").length} pending inquiries across your properties.
                    </div>
                )}
            </div>
        </LandlordMobileShell>
    );
}
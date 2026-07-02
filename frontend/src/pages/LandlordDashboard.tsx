import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AppNav } from "@/components/AppNav";
import { propertyService } from "@/services/property.service";
import { bookingService } from "@/services/booking.service";
import { ListingStatus } from "@/types";

const statusStyles: Record<ListingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-red-100 text-red-700",
  SUSPENDED: "bg-slate-200 text-slate-600",
};

export default function LandlordDashboard() {
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["my-properties"],
    queryFn: propertyService.listMine,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["landlord-bookings"],
    queryFn: bookingService.listForLandlord,
  });
  const pendingBookings = bookings.filter((b) => b.status === "PENDING");

  async function handleBookingResponse(id: string, status: "APPROVED" | "REJECTED") {
    await bookingService.respond(id, status);
    queryClient.invalidateQueries({ queryKey: ["landlord-bookings"] });
    queryClient.invalidateQueries({ queryKey: ["my-properties"] });
  }

  const occupied = properties.filter((p) => !p.isAvailable).length;
  const occupancyRate = properties.length ? Math.round((occupied / properties.length) * 100) : 0;

  async function toggleAvailability(id: string, isAvailable: boolean) {
    await propertyService.update(id, { isAvailable: !isAvailable });
    queryClient.invalidateQueries({ queryKey: ["my-properties"] });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this listing? This can't be undone.")) return;
    await propertyService.remove(id);
    queryClient.invalidateQueries({ queryKey: ["my-properties"] });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav />

      <main className="px-6 py-8 md:px-12 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-900">Your listings</h1>
          <Link
            to="/dashboard/listings/new"
            className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
          >
            + New listing
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs text-slate-500">Total listings</p>
            <p className="mt-1 text-xl font-bold text-brand-900">{properties.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs text-slate-500">Occupied</p>
            <p className="mt-1 text-xl font-bold text-brand-900">{occupied}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-xs text-slate-500">Occupancy rate</p>
            <p className="mt-1 text-xl font-bold text-brand-900">{occupancyRate}%</p>
          </div>
        </div>

        {pendingBookings.length > 0 && (
          <section className="mt-6">
            <h2 className="font-semibold text-slate-900">Booking requests awaiting your response</h2>
            <div className="mt-3 space-y-2">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{booking.property.title}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {booking.student?.firstName} {booking.student?.lastName} · Move-in{" "}
                      {new Date(booking.moveInDate).toLocaleDateString()}
                    </p>
                    {booking.message && <p className="text-xs text-slate-500 mt-1 italic">"{booking.message}"</p>}
                  </div>
                  <button
                    onClick={() => handleBookingResponse(booking.id, "APPROVED")}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleBookingResponse(booking.id, "REJECTED")}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
                  >
                    Decline
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {isLoading && <p className="mt-6 text-sm text-slate-500">Loading…</p>}

        {!isLoading && properties.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            You haven't listed a property yet.{" "}
            <Link to="/dashboard/listings/new" className="text-brand-600 font-medium hover:underline">
              Create your first listing
            </Link>
            .
          </div>
        )}

        <div className="mt-6 space-y-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4"
            >
              <div className="h-16 w-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                {property.images[0] && (
                  <img src={property.images[0].url} alt="" className="h-full w-full object-cover" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{property.title}</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[property.status]}`}>
                    {property.status.toLowerCase()}
                  </span>
                  {property.status === "REJECTED" && property.rejectionReason && (
                    <span className="text-xs text-red-500 truncate">{property.rejectionReason}</span>
                  )}
                  <span className="text-xs text-slate-400">{property._count?.bookings ?? 0} booking requests</span>
                </div>
              </div>

              <button
                onClick={() => toggleAvailability(property.id, property.isAvailable)}
                className="text-xs font-medium text-slate-600 hover:text-brand-600 whitespace-nowrap"
              >
                {property.isAvailable ? "Mark unavailable" : "Mark available"}
              </button>
              <Link to={`/dashboard/listings/${property.id}/edit`} className="text-xs font-medium text-brand-600 hover:underline">
                Edit
              </Link>
              <button onClick={() => handleDelete(property.id)} className="text-xs font-medium text-red-500 hover:underline">
                Delete
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

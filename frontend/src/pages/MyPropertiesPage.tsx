import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AgentMobileShell } from "@/components/AgentMobileShell";
import { AgentPropertyCard } from "@/components/AgentPropertyCard";
import { bookingService } from "@/services/booking.service";
import { propertyService } from "@/services/property.service";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MyPropertiesPage() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    const { data: properties = [], isLoading } = useQuery({
        queryKey: ["my-properties"],
        queryFn: propertyService.listMine,
        enabled: Boolean(user),
    });

    const { data: bookings = [] } = useQuery({
        queryKey: ["agent-bookings"],
        queryFn: bookingService.listForAgent,
        enabled: Boolean(user),
    });

    async function toggleAvailability(id: string, isAvailable: boolean) {
        await propertyService.update(id, { isAvailable: !isAvailable });
        queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    }

    return (
        <AgentMobileShell>
            <div className="page-enter space-y-5">
                <section>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Properties</p>
                    <h1 className="mt-1 font-display text-2xl font-semibold text-text.primary">My properties</h1>
                    <p className="mt-1 text-sm text-text.secondary">Manage listings, view approvals, and keep availability current.</p>
                </section>

                {isLoading && (
                    <div className="space-y-4">
                        <div className="h-24 w-full animate-pulse rounded-card bg-cream-100" />
                        <div className="h-24 w-full animate-pulse rounded-card bg-cream-100" />
                    </div>
                )}

                {!isLoading && properties.length === 0 && (
                    <Card variant="outlined" padding="lg">
                        <EmptyState
                            icon={
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                            }
                            title="No properties listed yet"
                            description="Add your first listing to start getting inquiries from students."
                            actionLabel="Add property"
                            onAction={() => navigate("/dashboard/listings/new")} />
                    </Card>
                )}

                <div className="space-y-4">
                    {properties.map((property) => (
                        <div key={property.id} className="space-y-3">
                            <AgentPropertyCard property={property} />
                            <div className="flex items-center justify-between gap-3 px-1">
                                <Button
                                    variant={property.isAvailable ? "secondary" : "primary"}
                                    size="sm"
                                    onClick={() => toggleAvailability(property.id, property.isAvailable)}
                                >
                                    {property.isAvailable ? "Mark unavailable" : "Mark available"}
                                </Button>
                                <span className="text-xs text-text.secondary">{property._count?.bookings ?? 0} inquiries</span>
                            </div>
                        </div>
                    ))}
                </div>

                {bookings.length > 0 && (
                    <Card variant="outlined" padding="md">
                        <p className="text-sm text-text.secondary">
                            You have {bookings.filter((booking) => booking.status === "PENDING").length} pending inquiries across your properties.
                        </p>
                    </Card>
                )}
            </div>
        </AgentMobileShell>
    );
}



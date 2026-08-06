import { Link } from "react-router-dom";
import { Property } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

function formatNaira(price: string) {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
        Number(price)
    );
}

export function LandlordPropertyCard({ property }: { property: Property }) {
    const primaryImage = property.images.find((image) => image.isPrimary) ?? property.images[0];

    return (
        <Card variant="outlined" className="overflow-hidden">
            <div className="grid grid-cols-[104px_1fr] gap-3 p-3">
                <div className="h-[104px] overflow-hidden rounded-card-sm bg-cream-100">
                    {primaryImage ? (
                        <img src={primaryImage.url} alt={property.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-xs text-text.secondary">No image</div>
                    )}
                </div>

                <div className="min-w-0 pr-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-text.primary">{property.title}</p>
                            <p className="mt-1 truncate text-xs text-text.secondary">{property.university?.name ?? "Edurus university"}</p>
                        </div>
                        <Badge variant={property.status === "APPROVED" ? "success" : property.status === "REJECTED" ? "error" : property.status === "SUSPENDED" ? "neutral" : "warning"} size="sm">{property.status.toLowerCase()}</Badge>
                    </div>

                    <p className="mt-2 text-sm font-bold text-text.primary">
                        {formatNaira(property.price)} <span className="text-xs font-normal text-text.secondary">/ year</span>
                    </p>
                    <p className="mt-1 text-xs text-text.secondary line-clamp-2">{property.location}</p>

                    <div className="mt-3 flex items-center gap-2">
                        <Link
                            to={`/properties/${property.id}`}
                            className="rounded-full bg-cream-100 px-3 py-2 text-xs font-semibold text-text.primary transition active:scale-95"
                        >
                            View
                        </Link>
                        <Link
                            to={`/dashboard/listings/${property.id}/edit`}
                            className="rounded-full bg-primary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary-700 active:scale-95"
                        >
                            Edit
                        </Link>
                    </div>
                </div>
            </div>
        </Card>
    );
}

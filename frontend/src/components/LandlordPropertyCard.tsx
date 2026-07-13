import { Link } from "react-router-dom";
import { Property } from "@/types";

function formatNaira(price: string) {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
        Number(price)
    );
}

interface LandlordPropertyCardProps {
    property: Property;
}

export function LandlordPropertyCard({ property }: LandlordPropertyCardProps) {
    const primaryImage = property.images.find((image) => image.isPrimary) ?? property.images[0];

    return (
        <div className="mobile-card-compact overflow-hidden">
            <div className="grid grid-cols-[104px_1fr] gap-3 p-3">
                <div className="h-[104px] overflow-hidden rounded-[18px] bg-cream-100">
                    {primaryImage ? (
                        <img src={primaryImage.url} alt={property.title} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>
                    )}
                </div>

                <div className="min-w-0 pr-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-slate-800">{property.title}</p>
                            <p className="mt-1 truncate text-xs text-slate-500">{property.university?.name ?? "Edurus university"}</p>
                        </div>
                        <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${property.status === "APPROVED"
                                ? "bg-emerald-100 text-emerald-700"
                                : property.status === "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : property.status === "SUSPENDED"
                                        ? "bg-slate-200 text-slate-600"
                                        : "bg-amber-100 text-amber-700"
                                }`}
                        >
                            {property.status.toLowerCase()}
                        </span>
                    </div>

                    <p className="mt-2 text-sm font-bold text-brand-900">
                        {formatNaira(property.price)} <span className="text-xs font-normal text-slate-400">/ year</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{property.location}</p>

                    <div className="mt-3 flex items-center gap-2">
                        <Link
                            to={`/properties/${property.id}`}
                            className="rounded-full bg-cream-100 px-3 py-2 text-xs font-semibold text-slate-800 transition active:scale-95"
                        >
                            View
                        </Link>
                        <Link
                            to={`/dashboard/listings/${property.id}/edit`}
                            className="rounded-full bg-brand-900 px-3 py-2 text-xs font-semibold text-white transition active:scale-95"
                        >
                            Edit
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
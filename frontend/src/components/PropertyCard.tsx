import { Link } from "react-router-dom";
import { Property } from "@/types";

function formatNaira(price: string) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    Number(price)
  );
}

interface PropertyCardProps {
  property: Property;
  isFavourited?: boolean;
  onToggleFavourite?: (id: string) => void;
}

export function PropertyCard({ property, isFavourited, onToggleFavourite }: PropertyCardProps) {
  const primaryImage = property.images.find((i) => i.isPrimary) ?? property.images[0];

  return (
    <div className="group overflow-hidden rounded-[24px] border border-brand-900/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
        )}

        {onToggleFavourite && (
          <button
            onClick={() => onToggleFavourite(property.id)}
            aria-label={isFavourited ? "Remove from favourites" : "Save to favourites"}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm backdrop-blur"
          >
            {isFavourited ? "❤️" : "🤍"}
          </button>
        )}

        {property.status === "APPROVED" && property.landlord?.isVerified ? (
          <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-900">
            Verified
          </span>
        ) : (
          <span className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600">
            New landlord
          </span>
        )}

        {!property.isAvailable && (
          <span className="absolute bottom-3 left-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white">
            Fully booked
          </span>
        )}
      </div>

      <Link to={`/properties/${property.id}`} className="block p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{property.title}</h3>
        </div>
        <p className="mt-1 text-sm text-slate-500 line-clamp-1">{property.location}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-cream-50 px-2.5 py-1">{property.bedrooms} bed</span>
          <span className="rounded-full bg-cream-50 px-2.5 py-1">{property.bathrooms} bath</span>
          <span className="rounded-full bg-cream-50 px-2.5 py-1">{Number(property.distanceFromCampusKm)}km</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="font-bold text-brand-900">
            {formatNaira(property.price)} <span className="text-xs font-normal text-slate-400">/ year</span>
          </p>
          <span className="text-sm font-semibold text-brand-900">View details →</span>
        </div>
      </Link>
    </div>
  );
}

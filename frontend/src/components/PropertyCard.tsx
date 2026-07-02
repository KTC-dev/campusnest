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
    <div className="group rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={property.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">No image</div>
        )}

        {onToggleFavourite && (
          <button
            onClick={() => onToggleFavourite(property.id)}
            aria-label={isFavourited ? "Remove from favourites" : "Save to favourites"}
            className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center text-lg shadow-sm"
          >
            {isFavourited ? "❤️" : "🤍"}
          </button>
        )}

        {!property.isAvailable && (
          <span className="absolute bottom-3 left-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white">
            Fully booked
          </span>
        )}
      </div>

      <Link to={`/properties/${property.id}`} className="block p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{property.title}</h3>
        </div>
        <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">{property.location}</p>

        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
          <span>{property.bedrooms} bed</span>
          <span>·</span>
          <span>{property.bathrooms} bath</span>
          <span>·</span>
          <span>{Number(property.distanceFromCampusKm)}km from campus</span>
        </div>

        <p className="mt-3 font-bold text-brand-600">
          {formatNaira(property.price)} <span className="text-xs font-normal text-slate-400">/ year</span>
        </p>
      </Link>
    </div>
  );
}

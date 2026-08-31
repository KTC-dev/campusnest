import { Link } from "react-router-dom";
import { Property } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";

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
    <Card variant="default" className="overflow-hidden transition-all duration-200 hover:-translate-y-0.5 shadow-soft hover:shadow-premium">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text.secondary">No image</div>
        )}

        {onToggleFavourite && (
          <button
            onClick={() => onToggleFavourite(property.id)}
            aria-label={isFavourited ? "Remove from favourites" : "Save to favourites"}
            className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm backdrop-blur transition-transform active:scale-95"
          >
            {isFavourited ? "??" : "??"}
          </button>
        )}

        {property.status === "APPROVED" && property.agent?.isVerified && (
          <span className="absolute left-3 top-3">
            <VerifiedBadge size={16} showText />
          </span>
        )}

        {!property.isAvailable && (
          <span className="absolute bottom-3 left-3">
            <Badge variant="neutral" size="sm">Fully booked</Badge>
          </span>
        )}
      </div>

      <Link to={`/properties/${property.id}`} className="block p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-text.primary line-clamp-1">{property.title}</h3>
        </div>
        <p className="mt-1 text-sm text-text.secondary line-clamp-1">{property.location}</p>
        {property.university?.name && <p className="mt-1 text-xs font-medium text-primary-600">{property.university.name}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-text.secondary">
          <span className="rounded-full bg-cream-50 px-2.5 py-1">{property.bedrooms} bed</span>
          <span className="rounded-full bg-cream-50 px-2.5 py-1">{property.bathrooms} bath</span>
          <span className="rounded-full bg-cream-50 px-2.5 py-1">{Number(property.distanceFromCampusKm)}km</span>
        </div>

        {(property.averageRating ?? 0) > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <StarRating rating={property.averageRating!} readonly size="sm" />
            <span className="text-xs text-text.secondary">({property.reviewCount})</span>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <p className="font-bold text-text.primary">
            {formatNaira(property.price)} <span className="text-xs font-normal text-text.secondary">/ year</span>
          </p>
          <span className="text-sm font-semibold text-primary-600">View details ?</span>
        </div>
      </Link>
    </Card>
  );
}


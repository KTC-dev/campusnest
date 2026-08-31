import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { PropertyCard } from "@/components/PropertyCard";
import { propertyService } from "@/services/property.service";

export function FeaturedPropertiesSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["properties", { availableOnly: true, page: 1, pageSize: 8 }],
    queryFn: () => propertyService.list({ availableOnly: true, page: 1 }),
  });

  const properties = data?.items.slice(0, 8) ?? [];

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brand-600">
            Featured properties
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-brand-950 sm:text-4xl">
            Homes chosen for comfort, location, and trust.
          </h2>
          <p className="mt-4 text-lg leading-8 text-text.secondary">
            Browse a carefully selected set of verified listings near campus, each reviewed for quality and clarity.
          </p>
        </div>
        <Link
          to="/properties"
          className="shrink-0 rounded-full bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-950 hover:shadow-premium active:scale-95"
        >
          Explore all listings →
        </Link>
      </div>

      {isLoading && (
        <p className="mt-10 text-sm text-text.secondary">Loading listings…</p>
      )}

      {!isLoading && properties.length === 0 && (
        <p className="mt-10 text-sm text-text.secondary">
          No verified listings yet — check back soon, or{" "}
          <Link to="/register?role=agent" className="font-medium text-brand-900 transition-colors hover:text-brand-950">
            be the first agent to list one
          </Link>
          .
        </p>
      )}

      <div className="mt-12 grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-4">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}

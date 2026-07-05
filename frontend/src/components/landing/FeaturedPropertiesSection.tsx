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
    <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">Featured properties</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-brand-950 sm:text-4xl">
            Homes chosen for comfort, location, and trust.
          </h2>
          <p className="mt-3 text-lg leading-8 text-slate-600">
            Browse a carefully selected set of verified listings near campus, each reviewed for quality and clarity.
          </p>
        </div>
        <Link to="/properties" className="text-sm font-semibold text-brand-900 transition-colors hover:text-brand-950">
          Explore all listings →
        </Link>
      </div>

      {isLoading && <p className="mt-8 text-sm text-slate-500">Loading listings…</p>}

      {!isLoading && properties.length === 0 && (
        <p className="mt-8 text-sm text-slate-500">
          No verified listings yet — check back soon, or{" "}
          <Link to="/register?role=landlord" className="font-medium text-brand-900 hover:underline">
            be the first landlord to list one
          </Link>
          .
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}

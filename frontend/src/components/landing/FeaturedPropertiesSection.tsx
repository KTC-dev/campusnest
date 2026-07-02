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
    <section className="px-6 py-16 md:px-12 max-w-6xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-brand-900">Featured properties</h2>
          <p className="mt-1 text-slate-500">Verified listings near campus, ready to book.</p>
        </div>
        <Link to="/properties" className="hidden sm:block text-sm font-semibold text-brand-600 hover:underline">
          View all →
        </Link>
      </div>

      {isLoading && <p className="mt-6 text-sm text-slate-500">Loading listings…</p>}

      {!isLoading && properties.length === 0 && (
        <p className="mt-6 text-sm text-slate-500">
          No verified listings yet — check back soon, or{" "}
          <Link to="/register?role=landlord" className="text-brand-600 font-medium hover:underline">
            be the first landlord to list one
          </Link>
          .
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link to="/properties" className="text-sm font-semibold text-brand-600 hover:underline">
          View all listings →
        </Link>
      </div>
    </section>
  );
}

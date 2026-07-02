import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { propertyService } from "@/services/property.service";

function useCountUp(target: number, durationMs = 1200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || target === 0) return;
    started.current = true;
    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3)))); // ease-out cubic
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, durationMs]);

  return value;
}

function Counter({ target, label }: { target: number; label: string }) {
  const value = useCountUp(target);
  return (
    <div className="text-center">
      <p className="text-3xl md:text-4xl font-bold text-white">{value.toLocaleString()}+</p>
      <p className="mt-1 text-sm text-brand-50/80">{label}</p>
    </div>
  );
}

export function StatsSection() {
  const { data } = useQuery({ queryKey: ["public-stats"], queryFn: propertyService.getPublicStats });

  return (
    <section className="bg-brand-600 px-6 py-14 md:px-12">
      <div className="max-w-5xl mx-auto grid grid-cols-2 gap-8 md:grid-cols-4">
        <Counter target={data?.studentsRegistered ?? 0} label="Students Registered" />
        <Counter target={data?.verifiedProperties ?? 0} label="Verified Properties" />
        <Counter target={data?.verifiedLandlords ?? 0} label="Trusted Landlords" />
        <Counter target={data?.successfulBookings ?? 0} label="Successful Bookings" />
      </div>
    </section>
  );
}

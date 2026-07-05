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
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [target, durationMs]);

  return value;
}

function Counter({ target, label }: { target: number; label: string }) {
  const value = useCountUp(target);
  return (
    <div className="rounded-[24px] border border-white/15 bg-white/10 p-6 text-center backdrop-blur-sm">
      <p className="text-3xl font-semibold text-white sm:text-4xl">{value.toLocaleString()}+</p>
      <p className="mt-2 text-sm text-brand-50/80">{label}</p>
    </div>
  );
}

export function StatsSection() {
  const { data } = useQuery({ queryKey: ["public-stats"], queryFn: propertyService.getPublicStats });

  return (
    <section className="bg-brand-900 px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-100">Growth in motion</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
            A platform built around trust and momentum.
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Counter target={data?.studentsRegistered ?? 0} label="Students registered" />
          <Counter target={data?.verifiedProperties ?? 0} label="Verified properties" />
          <Counter target={data?.verifiedLandlords ?? 0} label="Trusted landlords" />
          <Counter target={data?.successfulBookings ?? 0} label="Successful bookings" />
        </div>
      </div>
    </section>
  );
}

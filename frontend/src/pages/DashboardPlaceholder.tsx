import { useAuthStore } from "@/store/authStore";

// A single placeholder that role-switches its heading. Real
// StudentDashboard / LandlordDashboard / AdminDashboard pages replace this
// in Phase 2 and Phase 4 respectively.
export default function DashboardPlaceholder() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-sm font-medium text-brand-500 uppercase tracking-wide">{user?.role}</p>
        <h1 className="mt-2 text-2xl font-bold text-brand-900">
          You're logged in, {user?.email}
        </h1>
        <p className="mt-2 text-slate-500">
          The {user?.role?.toLowerCase()} dashboard is built in the next phase.
        </p>
      </div>
    </div>
  );
}

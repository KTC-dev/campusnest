import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AppNav } from "@/components/AppNav";
import { adminService } from "@/services/admin.service";

type Tab = "overview" | "moderation" | "students" | "landlords" | "bookings";

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "moderation", label: "Pending listings" },
  { id: "students", label: "Students" },
  { id: "landlords", label: "Landlords" },
  { id: "bookings", label: "Bookings" },
];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-brand-900">{value}</p>
    </div>
  );
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function OverviewTab() {
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: adminService.getStats });
  const { data: analytics } = useQuery({ queryKey: ["admin-analytics"], queryFn: adminService.getAnalytics });

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total users" value={stats?.totalUsers ?? "—"} />
        <StatCard label="Students" value={stats?.totalStudents ?? "—"} />
        <StatCard label="Landlords" value={stats?.totalLandlords ?? "—"} />
        <StatCard label="Properties" value={stats?.totalProperties ?? "—"} />
        <StatCard label="Pending approvals" value={stats?.pendingApprovals ?? "—"} />
        <StatCard label="Total bookings" value={stats?.totalBookings ?? "—"} />
        <StatCard label="Approved bookings" value={stats?.approvedBookings ?? "—"} />
        <StatCard label="Revenue" value={stats ? `₦${stats.revenue.toLocaleString()}` : "—"} />
      </div>

      {analytics && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-sm font-semibold text-slate-700">New listings (30 days)</p>
            <div className="mt-2 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.listingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 10 }} interval={4} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip labelFormatter={formatShortDate} />
                  <Line type="monotone" dataKey="count" stroke="#2b7de9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-sm font-semibold text-slate-700">New bookings (30 days)</p>
            <div className="mt-2 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.bookingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 10 }} interval={4} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip labelFormatter={formatShortDate} />
                  <Line type="monotone" dataKey="count" stroke="#1c62c9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModerationTab() {
  const queryClient = useQueryClient();
  const { data: pending = [], isLoading } = useQuery({
    queryKey: ["admin-pending-properties"],
    queryFn: adminService.listPendingProperties,
  });

  async function handleDecision(id: string, status: "APPROVED" | "REJECTED") {
    const rejectionReason = status === "REJECTED" ? prompt("Reason for rejection (shown to the landlord):") ?? undefined : undefined;
    await adminService.moderateProperty(id, status, rejectionReason);
    queryClient.invalidateQueries({ queryKey: ["admin-pending-properties"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  }

  async function handleRemoveFraudulent(id: string) {
    if (!confirm("Permanently remove this listing as fraudulent? This cannot be undone.")) return;
    await adminService.removeFraudulentListing(id);
    queryClient.invalidateQueries({ queryKey: ["admin-pending-properties"] });
  }

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (pending.length === 0) return <p className="text-sm text-slate-500">No listings awaiting review. 🎉</p>;

  return (
    <div className="space-y-3">
      {pending.map((property) => (
        <div key={property.id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4">
          <div className="h-16 w-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
            {property.images[0] && <img src={property.images[0].url} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 truncate">{property.title}</p>
            <p className="text-xs text-slate-500 truncate">
              {property.location} · {property.landlord?.firstName} {property.landlord?.lastName}
            </p>
          </div>
          <button
            onClick={() => handleDecision(property.id, "APPROVED")}
            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
          >
            Approve
          </button>
          <button
            onClick={() => handleDecision(property.id, "REJECTED")}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            Reject
          </button>
          <button onClick={() => handleRemoveFraudulent(property.id)} className="text-xs font-medium text-red-500 hover:underline">
            Remove (fraud)
          </button>
        </div>
      ))}
    </div>
  );
}

function StudentsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-students"], queryFn: () => adminService.listStudents() });

  async function toggleActive(userId: string, isActive: boolean) {
    await adminService.setUserActive(userId, !isActive);
    queryClient.invalidateQueries({ queryKey: ["admin-students"] });
  }

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
          <th className="pb-2">Name</th>
          <th className="pb-2">Email</th>
          <th className="pb-2">University</th>
          <th className="pb-2">Status</th>
          <th className="pb-2"></th>
        </tr>
      </thead>
      <tbody>
        {data?.items.map((s) => (
          <tr key={s.id} className="border-b border-slate-50">
            <td className="py-2">{s.firstName} {s.lastName}</td>
            <td className="py-2 text-slate-500">{s.user.email}</td>
            <td className="py-2 text-slate-500">{s.university.name}</td>
            <td className="py-2">
              <span className={`rounded-full px-2 py-0.5 text-xs ${s.user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                {s.user.isActive ? "active" : "deactivated"}
              </span>
            </td>
            <td className="py-2 text-right">
              <button onClick={() => toggleActive(s.id, s.user.isActive)} className="text-xs font-medium text-brand-600 hover:underline">
                {s.user.isActive ? "Deactivate" : "Reactivate"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LandlordsTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-landlords"], queryFn: () => adminService.listLandlords() });

  async function toggleActive(userId: string, isActive: boolean) {
    await adminService.setUserActive(userId, !isActive);
    queryClient.invalidateQueries({ queryKey: ["admin-landlords"] });
  }

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
          <th className="pb-2">Name</th>
          <th className="pb-2">Email</th>
          <th className="pb-2">Listings</th>
          <th className="pb-2">Status</th>
          <th className="pb-2"></th>
        </tr>
      </thead>
      <tbody>
        {data?.items.map((l) => (
          <tr key={l.id} className="border-b border-slate-50">
            <td className="py-2">{l.businessName || `${l.firstName} ${l.lastName}`}</td>
            <td className="py-2 text-slate-500">{l.user.email}</td>
            <td className="py-2 text-slate-500">{l._count.properties}</td>
            <td className="py-2">
              <span className={`rounded-full px-2 py-0.5 text-xs ${l.user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                {l.user.isActive ? "active" : "deactivated"}
              </span>
            </td>
            <td className="py-2 text-right">
              <button onClick={() => toggleActive(l.id, l.user.isActive)} className="text-xs font-medium text-brand-600 hover:underline">
                {l.user.isActive ? "Deactivate" : "Reactivate"}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BookingsTab() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-bookings"], queryFn: () => adminService.listBookings() });

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-slate-500 border-b border-slate-100">
          <th className="pb-2">Property</th>
          <th className="pb-2">Student</th>
          <th className="pb-2">Move-in</th>
          <th className="pb-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {data?.items.map((b) => (
          <tr key={b.id} className="border-b border-slate-50">
            <td className="py-2">{b.property.title}</td>
            <td className="py-2 text-slate-500">{b.student.firstName} {b.student.lastName}</td>
            <td className="py-2 text-slate-500">{new Date(b.moveInDate).toLocaleDateString()}</td>
            <td className="py-2 capitalize">{b.status.toLowerCase()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav />

      <main className="px-6 py-8 md:px-12 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-brand-900">Admin dashboard</h1>

        <div className="mt-4 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm font-medium w-fit">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                tab === t.id ? "bg-white shadow-sm text-brand-600" : "text-slate-500"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "overview" && <OverviewTab />}
          {tab === "moderation" && <ModerationTab />}
          {tab === "students" && <StudentsTab />}
          {tab === "landlords" && <LandlordsTab />}
          {tab === "bookings" && <BookingsTab />}
        </div>
      </main>
    </div>
  );
}

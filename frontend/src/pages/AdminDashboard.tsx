import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { ImageGalleryViewer, GalleryImage } from "@/components/ImageGalleryViewer";
import { verificationService } from "@/services/verification.service";
import { useToastStore } from "@/store/toastStore";
import { getFriendlyErrorMessage } from "@/utils/error";
import type { VerificationRequest, VerificationStatus } from "@/types";

type Tab = "overview" | "moderation" | "students" | "landlords" | "bookings" | "verifications";
type DecisionMode = "approve" | "reject" | null;

const tabs: { id: Tab; label: string; shortLabel: string; icon: string }[] = [
    { id: "overview", label: "Overview", shortLabel: "Overview", icon: "◉" },
    { id: "moderation", label: "Pending listings", shortLabel: "Listings", icon: "▣" },
    { id: "students", label: "Students", shortLabel: "Students", icon: "◌" },
    { id: "landlords", label: "Landlords", shortLabel: "Landlords", icon: "⌂" },
    { id: "bookings", label: "Bookings", shortLabel: "Bookings", icon: "↳" },
    { id: "verifications", label: "Verifications", shortLabel: "Verifications", icon: "✓" },
];

function formatDate(value?: string | null) {
    if (!value) return "Not provided";
    return new Date(value).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatDay(value?: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getInitials(firstName?: string | null, lastName?: string | null, fallback?: string) {
    const initials = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();
    if (initials) return initials.toUpperCase();
    return fallback?.slice(0, 2).toUpperCase() ?? "NN";
}

function statusTone(status: VerificationStatus) {
    switch (status) {
        case "VERIFIED":
            return "bg-emerald-100 text-emerald-700 ring-emerald-200";
        case "REJECTED":
            return "bg-rose-100 text-rose-700 ring-rose-200";
        case "SUSPENDED":
            return "bg-slate-200 text-slate-700 ring-slate-300";
        case "UNDER_REVIEW":
            return "bg-amber-100 text-amber-700 ring-amber-200";
        default:
            return "bg-sky-100 text-sky-700 ring-sky-200";
    }
}

function listingStatusTone(status?: string) {
    if (status === "APPROVED") return "bg-emerald-100 text-emerald-700";
    if (status === "REJECTED") return "bg-rose-100 text-rose-700";
    if (status === "SUSPENDED") return "bg-slate-200 text-slate-700";
    return "bg-amber-100 text-amber-700";
}

function isPdf(url: string) {
    return /\.pdf($|\?)/i.test(url) || /format=pdf/i.test(url);
}

function IconStat({ icon, label, value, tone = "bg-brand-900 text-white" }: { icon: string; label: string; value: string | number; tone?: string }) {
    return (
        <div className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
                </div>
                <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl text-base ${tone}`}>{icon}</span>
            </div>
        </div>
    );
}

function SectionCard({ title, eyebrow, children }: { title: string; eyebrow?: string; children: React.ReactNode }) {
    return (
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{eyebrow}</p>}
                    <h2 className="mt-1 text-lg font-semibold text-slate-950">{title}</h2>
                </div>
            </div>
            {children}
        </section>
    );
}

function Dialog({ title, description, onClose, children, footer }: { title: string; description?: string; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode }) {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
            <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl sm:h-auto sm:max-h-[92vh] sm:rounded-[28px]" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
                        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                    </div>
                    <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50">
                        ✕
                    </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">{children}</div>
                {footer && <div className="border-t border-slate-200 px-4 py-4 sm:px-6">{footer}</div>}
            </div>
        </div>
    );
}

function SidebarNav({ activeTab, onChange, collapsed, onToggleCollapsed, mobileOpen, onCloseMobile }: { activeTab: Tab; onChange: (tab: Tab) => void; collapsed: boolean; onToggleCollapsed: () => void; mobileOpen: boolean; onCloseMobile: () => void }) {
    return (
        <>
            <aside className={`hidden md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-r md:border-slate-200 md:bg-white ${collapsed ? "md:w-24" : "md:w-72"}`}>
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-5">
                    <div className={`min-w-0 ${collapsed ? "hidden" : "block"}`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Edurus</p>
                        <h1 className="mt-1 text-xl font-semibold text-slate-950">Admin panel</h1>
                    </div>
                    <button type="button" onClick={onToggleCollapsed} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50">
                        {collapsed ? ">" : "<"}
                    </button>
                </div>
                <nav className="flex-1 space-y-2 p-3">
                    {tabs.map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => onChange(tab.id)}
                                className={`flex w-full items-center gap-3 rounded-[20px] px-4 py-3 text-left transition ${active ? "bg-brand-900 text-white shadow-lg shadow-brand-900/15" : "text-slate-600 hover:bg-slate-100"}`}
                            >
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold">{tab.icon}</span>
                                <span className={`text-sm font-semibold ${collapsed ? "hidden" : "block"}`}>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>
                <div className={`border-t border-slate-200 p-4 text-xs text-slate-500 ${collapsed ? "hidden" : "block"}`}>
                    Responsive review tools, approval workflows, and moderation history in one place.
                </div>
            </aside>

            {mobileOpen && (
                <div className="fixed inset-0 z-50 bg-slate-950/40 md:hidden" onClick={onCloseMobile}>
                    <div className="absolute inset-y-0 left-0 w-[84%] max-w-sm bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">Edurus</p>
                                <h1 className="mt-1 text-lg font-semibold text-slate-950">Admin panel</h1>
                            </div>
                            <button type="button" onClick={onCloseMobile} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600">
                                ✕
                            </button>
                        </div>
                        <nav className="space-y-2 p-3">
                            {tabs.map((tab) => {
                                const active = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => {
                                            onChange(tab.id);
                                            onCloseMobile();
                                        }}
                                        className={`flex w-full items-center gap-3 rounded-[18px] px-4 py-3 text-left transition ${active ? "bg-brand-900 text-white" : "bg-slate-50 text-slate-700"}`}
                                    >
                                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold">{tab.icon}</span>
                                        <span className="text-sm font-semibold">{tab.shortLabel}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
}

function ThumbnailStrip({ documents, onOpen }: { documents: { label: string; url: string }[]; onOpen: (label: string, url: string) => void }) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {documents.map((document) => {
                const pdf = isPdf(document.url);
                return (
                    <button key={document.label} type="button" onClick={() => onOpen(document.label, document.url)} className="group flex w-full flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg">
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                            {pdf ? (
                                <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,_#0f172a_0%,_#334155_100%)] text-white">
                                    <div className="text-center">
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">PDF</p>
                                        <p className="mt-2 text-3xl">📄</p>
                                    </div>
                                </div>
                            ) : (
                                <img src={document.url} alt={document.label} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                        </div>
                        <div className="flex items-center justify-between gap-3 p-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900">{document.label}</p>
                                <p className="text-xs text-slate-500">Tap to preview</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Open</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

function DocumentViewerModal({ title, url, onClose }: { title: string; url: string; onClose: () => void }) {
    const [zoom, setZoom] = useState(1);
    const pdf = isPdf(url);

    useEffect(() => {
        setZoom(1);
    }, [url]);

    return (
        <Dialog
            title={title}
            description="Preview the uploaded document, zoom in for details, or open the file in a separate tab."
            onClose={onClose}
            footer={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-3 text-sm text-slate-600">
                        Zoom
                        <input type="range" min="1" max="2.5" step="0.1" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="w-48" />
                        <span className="font-semibold text-slate-900">{Math.round(zoom * 100)}%</span>
                    </label>
                    <div className="flex gap-2">
                        <button type="button" onClick={onClose} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                            Close
                        </button>
                        <button type="button" onClick={() => window.open(url, "_blank", "noopener,noreferrer")} className="rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white">
                            View Full Size
                        </button>
                    </div>
                </div>
            }
        >
            <div className="flex min-h-[40vh] items-center justify-center overflow-auto rounded-[24px] bg-slate-50 p-4">
                {pdf ? (
                    <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }} className="w-full max-w-4xl">
                        <iframe title={title} src={url} className="h-[65vh] w-full rounded-[20px] border border-slate-200 bg-white" />
                    </div>
                ) : (
                    <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }} className="w-full max-w-4xl">
                        <img src={url} alt={title} className="max-h-[72vh] w-full rounded-[24px] object-contain shadow-2xl" />
                    </div>
                )}
            </div>
        </Dialog>
    );
}

function VerificationDecisionModal({ mode, item, onClose, onConfirm, isSubmitting }: { mode: DecisionMode; item: VerificationRequest | null; onClose: () => void; onConfirm: (note: string) => void; isSubmitting: boolean }) {
    const [note, setNote] = useState("");

    useEffect(() => {
        setNote("");
    }, [mode, item?.id]);

    if (!mode || !item) return null;

    const isReject = mode === "reject";

    return (
        <Dialog
            title={isReject ? "Reject verification" : "Approve verification"}
            description={isReject ? "A rejection reason is required and will be saved with the verification record." : "Add an optional internal note before confirming approval."}
            onClose={onClose}
            footer={
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button type="button" onClick={onClose} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={isSubmitting || (isReject && !note.trim())}
                        onClick={() => onConfirm(note.trim())}
                        className={`rounded-full px-4 py-2 text-sm font-semibold text-white ${isReject ? "bg-rose-600" : "bg-emerald-600"} disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                        {isSubmitting ? "Saving…" : isReject ? "Confirm rejection" : "Confirm approval"}
                    </button>
                </div>
            }
        >
            <div className="space-y-4">
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{item.landlord?.businessName ?? `${item.landlord?.firstName ?? "Landlord"} ${item.landlord?.lastName ?? ""}`.trim()}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.user?.email ?? "Email not available"}</p>
                </div>
                <label className="block text-sm font-medium text-slate-700">
                    {isReject ? "Rejection reason" : "Admin note"}
                    <textarea
                        rows={5}
                        required={isReject}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder={isReject ? "Explain why the verification is being rejected" : "Add an internal note for the review record"}
                        className="mt-2 w-full rounded-[18px] border border-slate-300 px-4 py-3 text-sm outline-none ring-0 focus:border-brand-500"
                    />
                </label>
            </div>
        </Dialog>
    );
}

function HistoryRow({ label, value, tone }: { label: string; value: string; tone: string }) {
    return (
        <div className="flex items-start gap-3 rounded-[18px] border border-slate-200 bg-slate-50 p-3">
            <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-[11px] font-semibold uppercase tracking-[0.18em] ${tone}`}>{label.slice(0, 2)}</span>
            <div>
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="text-sm text-slate-600">{value}</p>
            </div>
        </div>
    );
}

function PageHeader({ onMenu, activeTab, isCollapsed, onToggleCollapsed }: { onMenu: () => void; activeTab: Tab; isCollapsed: boolean; onToggleCollapsed: () => void }) {
    const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? "Overview";

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
                <button type="button" onClick={onMenu} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-700 md:hidden">
                    ☰
                </button>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Admin console</p>
                    <h1 className="truncate text-lg font-semibold text-slate-950 sm:text-2xl">{activeLabel}</h1>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                    <button type="button" onClick={onToggleCollapsed} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">
                        {isCollapsed ? "Expand" : "Collapse"}
                    </button>
                </div>
            </div>
        </header>
    );
}

/*
function OverviewTab() {
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: adminService.getStats });
  const { data: analytics } = useQuery({ queryKey: ["admin-analytics"], queryFn: adminService.getAnalytics });
  const { data: verifications = [] } = useQuery({ queryKey: ["admin-verifications"], queryFn: verificationService.listForAdmin });
  const { data: pendingProperties = [] } = useQuery({ queryKey: ["admin-pending-properties"], queryFn: adminService.listPendingProperties });

  const pendingVerifications = verifications.filter((item) => item.status === "PENDING" || item.status === "UNDER_REVIEW").length;
  const approvedListings = Math.max(0, (stats?.totalProperties ?? 0) - (stats?.pendingApprovals ?? 0));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <IconStat icon="⏳" label="Pending Verifications" value={pendingVerifications} tone="bg-amber-100 text-amber-700" />
        <IconStat icon="▦" label="Pending Listings" value={pendingProperties.length} tone="bg-sky-100 text-sky-700" />
        <IconStat icon="✓" label="Approved Listings" value={approvedListings} tone="bg-emerald-100 text-emerald-700" />
        <IconStat icon="◌" label="Total Students" value={stats?.totalStudents ?? "—"} tone="bg-brand-100 text-brand-800" />
        <IconStat icon="⌂" label="Total Landlords" value={stats?.totalLandlords ?? "—"} tone="bg-fuchsia-100 text-fuchsia-700" />
        <IconStat icon="↳" label="Active Bookings" value={stats?.approvedBookings ?? "—"} tone="bg-slate-100 text-slate-700" />
      </div>

      {analytics && (
        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard title="New listings trend" eyebrow="Analytics">
            <MiniTrend data={analytics.listingsTrend} colorClassName="bg-brand-900" />
          </SectionCard>
          <SectionCard title="New bookings trend" eyebrow="Analytics">
            <MiniTrend data={analytics.bookingsTrend} colorClassName="bg-emerald-600" />
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function MiniTrend({ data, colorClassName }: { data: { date: string; count: number }[]; colorClassName: string }) {
  const max = Math.max(...data.map((point) => point.count), 1);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 xl:grid-cols-10">
        {data.slice(-10).map((point) => (
          <div key={point.date} className="flex flex-col items-center gap-2">
            <div className="flex h-40 w-full items-end rounded-[18px] bg-slate-50 p-2">
              <div className={`w-full rounded-[14px] ${colorClassName}`} style={{ height: `${Math.max((point.count / max) * 100, point.count ? 8 : 4)}%` }} />
            </div>
            <span className="text-[11px] text-slate-500">{new Date(point.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ModerationTab() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { data: pending = [], isLoading } = useQuery({ queryKey: ["admin-pending-properties"], queryFn: adminService.listPendingProperties });

  async function handleDecision(id: string, status: "APPROVED" | "REJECTED") {
    setProcessingId(id);
    try {
      const rejectionReason = status === "REJECTED" ? window.prompt("Reason for rejection:") ?? undefined : undefined;
      await adminService.moderateProperty(id, status, rejectionReason);
      queryClient.invalidateQueries({ queryKey: ["admin-pending-properties"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      addToast({ type: "success", title: status === "APPROVED" ? "Listing approved" : "Listing rejected", message: "The moderation decision has been saved." });
    } catch (error) {
      addToast({ type: "error", title: "Decision failed", message: getFriendlyErrorMessage(error) });
    } finally {
      setProcessingId(null);
    }
  }

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (pending.length === 0) return <p className="text-sm text-slate-500">No listings awaiting review. 🎉</p>;

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {pending.map((property) => (
        <div key={property.id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
            <div className="aspect-[4/3] bg-slate-100">
              {property.images[0] ? <img src={property.images[0].url} alt={property.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400">No image</div>}
            </div>
            <div className="space-y-4 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{property.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {property.location} · {property.landlord?.firstName} {property.landlord?.lastName}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${listingStatusTone(property.status)}`}>{property.status}</span>
              </div>
              <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p>Price: ₦{property.price}</p>
                <p>Rooms: {property.bedrooms} bed / {property.bathrooms} bath</p>
                <p>Distance: {property.distanceFromCampusKm} km</p>
                <p>Type: {property.roomType.replace("_", " ")}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button onClick={() => handleDecision(property.id, "APPROVED")} disabled={processingId === property.id} className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
                  {processingId === property.id ? "Working…" : "Approve"}
                </button>
                <button onClick={() => handleDecision(property.id, "REJECTED")} disabled={processingId === property.id} className="rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
                  {processingId === property.id ? "Working…" : "Reject"}
                </button>
                <button onClick={() => adminService.removeFraudulentListing(property.id)} disabled={processingId === property.id} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-70">
                  Remove fraud
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PeopleRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
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
    <>
      <div className="grid gap-3 md:hidden">
        {data?.items.map((student) => (
          <div key={student.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-slate-950">{student.firstName} {student.lastName}</p>
                <p className="text-sm text-slate-500">{student.user.email}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${student.user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{student.user.isActive ? "active" : "inactive"}</span>
            </div>
            <div className="mt-3 space-y-2">
              <PeopleRow label="University" value={student.university.name} />
              <PeopleRow label="Joined" value={formatDay(student.user.createdAt)} />
            </div>
            <button onClick={() => toggleActive(student.id, student.user.isActive)} className="mt-4 w-full rounded-full bg-brand-900 px-4 py-3 text-sm font-semibold text-white">
              {student.user.isActive ? "Deactivate" : "Reactivate"}
            </button>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">University</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((student) => (
              <tr key={student.id} className="border-t border-slate-100">
                <td className="px-4 py-4 font-medium text-slate-900">{student.firstName} {student.lastName}</td>
                <td className="px-4 py-4 text-slate-600">{student.user.email}</td>
                <td className="px-4 py-4 text-slate-600">{student.university.name}</td>
                <td className="px-4 py-4 text-slate-600">{formatDay(student.user.createdAt)}</td>
                <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${student.user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{student.user.isActive ? "active" : "inactive"}</span></td>
                <td className="px-4 py-4 text-right"><button onClick={() => toggleActive(student.id, student.user.isActive)} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">{student.user.isActive ? "Deactivate" : "Reactivate"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
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
    <>
      <div className="grid gap-3 md:hidden">
        {data?.items.map((landlord) => (
          <div key={landlord.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-slate-950">{landlord.businessName || `${landlord.firstName} ${landlord.lastName}`}</p>
                <p className="text-sm text-slate-500">{landlord.user.email}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${landlord.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{landlord.isVerified ? "verified" : "pending"}</span>
            </div>
            <div className="mt-3 space-y-2">
              <PeopleRow label="Listings" value={String(landlord._count.properties)} />
              <PeopleRow label="Joined" value={formatDay(landlord.user.createdAt)} />
            </div>
            <button onClick={() => toggleActive(landlord.id, landlord.user.isActive)} className="mt-4 w-full rounded-full bg-brand-900 px-4 py-3 text-sm font-semibold text-white">
              {landlord.user.isActive ? "Deactivate" : "Reactivate"}
            </button>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Listings</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((landlord) => (
              <tr key={landlord.id} className="border-t border-slate-100">
                <td className="px-4 py-4 font-medium text-slate-900">{landlord.businessName || `${landlord.firstName} ${landlord.lastName}`}</td>
                <td className="px-4 py-4 text-slate-600">{landlord.user.email}</td>
                <td className="px-4 py-4 text-slate-600">{landlord._count.properties}</td>
                <td className="px-4 py-4 text-slate-600">{formatDay(landlord.user.createdAt)}</td>
                <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${landlord.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{landlord.isVerified ? "verified" : "pending"}</span></td>
                <td className="px-4 py-4 text-right"><button onClick={() => toggleActive(landlord.id, landlord.user.isActive)} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">{landlord.user.isActive ? "Deactivate" : "Reactivate"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function BookingsTab() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-bookings"], queryFn: () => adminService.listBookings() });

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {data?.items.map((booking) => (
          <div key={booking.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-slate-950">{booking.property.title}</p>
                <p className="text-sm text-slate-500">{booking.student.firstName} {booking.student.lastName}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">{booking.status.toLowerCase()}</span>
            </div>
            <p className="mt-3 text-sm text-slate-600">Move-in: {formatDay(booking.moveInDate)}</p>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 bg-white md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Move-in</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data?.items.map((booking) => (
              <tr key={booking.id} className="border-t border-slate-100">
                <td className="px-4 py-4 font-medium text-slate-900">{booking.property.title}</td>
                <td className="px-4 py-4 text-slate-600">{booking.student.firstName} {booking.student.lastName}</td>
                <td className="px-4 py-4 text-slate-600">{formatDay(booking.moveInDate)}</td>
                <td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">{booking.status.toLowerCase()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function VerificationCard({ item, onView, onApprove, onReject }: { item: VerificationRequest; onView: () => void; onApprove: () => void; onReject: () => void }) {
  const docs = [
    { label: "Government ID", url: item.idDocumentUrl },
    { label: "Selfie", url: item.selfieUrl },
    { label: "Proof of Ownership", url: item.proofOfOwnershipUrl },
  ].filter((document): document is { label: string; url: string } => Boolean(document.url));

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-brand-900 to-forest-800 text-lg font-bold text-white">
            {getInitials(item.landlord?.firstName, item.landlord?.lastName, item.user?.email)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-slate-950">{item.landlord?.businessName ?? `${item.landlord?.firstName ?? "Unknown"} ${item.landlord?.lastName ?? ""}`.trim()}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.user?.email ?? "Email unavailable"}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1 ${statusTone(item.status)}`}>{item.status.replace("_", " ")}</span>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>Phone: Not provided</p>
              <p>Business: {item.landlord?.businessName ?? "Not provided"}</p>
              <p>Registered: {formatDay(item.createdAt)}</p>
              <p>University: Not provided in current API</p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {docs.map((document) => (
            <button key={document.label} type="button" onClick={onView} className="overflow-hidden rounded-[18px] border border-slate-200 bg-slate-100 text-left">
              <div className="aspect-square bg-[linear-gradient(135deg,_#cbd5e1,_#f8fafc)]" />
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button onClick={onView} className="rounded-full bg-brand-900 px-4 py-3 text-sm font-semibold text-white">
            View details
          </button>
          <button onClick={onApprove} className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            Approve
          </button>
          <button onClick={onReject} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            Reject
          </button>
        </div>
      </div>
    </article>
  );
}

function VerificationDetailsModal({ item, onClose, onApprove, onReject, onOpenDocument }: { item: VerificationRequest; onClose: () => void; onApprove: () => void; onReject: () => void; onOpenDocument: (label: string, url: string) => void }) {
  const docs = [
    { label: "Government ID", url: item.idDocumentUrl },
    { label: "Selfie", url: item.selfieUrl },
    { label: "Proof of Ownership", url: item.proofOfOwnershipUrl },
  ].filter((document): document is { label: string; url: string } => Boolean(document.url));

  return (
    <Dialog
      title="Verification details"
      description="Review the landlord, inspect each document, and approve or reject without leaving the dashboard."
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button type="button" onClick={onReject} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
            Reject
          </button>
          <button type="button" onClick={onApprove} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
            Approve
          </button>
        </div>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
        <div className="space-y-4">
          <div className="rounded-[24px] border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-brand-900 to-forest-800 text-lg font-bold text-white">
                {getInitials(item.landlord?.firstName, item.landlord?.lastName, item.user?.email)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-slate-950">{item.landlord?.businessName ?? `${item.landlord?.firstName ?? "Unknown"} ${item.landlord?.lastName ?? ""}`.trim()}</h3>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1 ${statusTone(item.status)}`}>{item.status.replace("_", " ")}</span>
                </div>
                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p><span className="font-semibold text-slate-900">Email:</span> {item.user?.email ?? "Not available"}</p>
                  <p><span className="font-semibold text-slate-900">Phone:</span> Not provided in current API</p>
                  <p><span className="font-semibold text-slate-900">Business:</span> {item.landlord?.businessName ?? "Not provided"}</p>
                  <p><span className="font-semibold text-slate-900">University:</span> Not provided in current API</p>
                  <p><span className="font-semibold text-slate-900">Registration date:</span> {formatDate(item.createdAt)}</p>
                  <p><span className="font-semibold text-slate-900">Property count:</span> Not provided in current API</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Uploaded documents</p>
            <div className="mt-4 space-y-3">
              <ThumbnailStrip documents={docs} onOpen={onOpenDocument} />
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Verification history</p>
            <div className="mt-4 space-y-3">
              <HistoryRow label="Submitted" value={formatDate(item.createdAt)} tone="bg-sky-100 text-sky-700" />
              <HistoryRow label="Last updated" value={formatDate(item.reviewedAt ?? item.createdAt)} tone="bg-brand-100 text-brand-800" />
              <HistoryRow label="Ownership confirmation" value={item.submitterConfirmation ? "Confirmed by landlord" : "Not confirmed"} tone={item.submitterConfirmation ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"} />
              <HistoryRow label="Admin notes" value={item.adminNotes ?? "No notes yet"} tone="bg-slate-100 text-slate-700" />
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Fast summary</p>
            <div className="mt-4 grid gap-3 text-sm text-white/85">
              <p><span className="text-white/60">Submission date:</span> {formatDate(item.createdAt)}</p>
              <p><span className="text-white/60">Last updated:</span> {formatDate(item.reviewedAt)}</p>
              <p><span className="text-white/60">Status:</span> {item.status.replace("_", " ")}</p>
              <p><span className="text-white/60">Ownership confirmed:</span> {item.submitterConfirmation ? "Yes" : "No"}</p>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Review controls</p>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <p>Approvals and rejections reuse the existing API routes and keep the current backend behavior intact.</p>
              <p>Rejections require a reason so the note is preserved in the database.</p>
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <button type="button" onClick={onApprove} className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">
                Approve verification
              </button>
              <button type="button" onClick={onReject} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                Reject verification
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Dialog>
  );
}

*/

function OverviewTab() {
    const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: adminService.getStats });
    const { data: analytics } = useQuery({ queryKey: ["admin-analytics"], queryFn: adminService.getAnalytics });
    const { data: verifications = [] } = useQuery({ queryKey: ["admin-verifications"], queryFn: verificationService.listForAdmin });
    const { data: pendingProperties = [] } = useQuery({ queryKey: ["admin-pending-properties"], queryFn: adminService.listPendingProperties });

    const pendingVerifications = verifications.filter((item) => item.status === "PENDING" || item.status === "UNDER_REVIEW").length;
    const approvedListings = Math.max(0, (stats?.totalProperties ?? 0) - (stats?.pendingApprovals ?? 0));

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                <IconStat icon="⏳" label="Pending Verifications" value={pendingVerifications} tone="bg-amber-100 text-amber-700" />
                <IconStat icon="▦" label="Pending Listings" value={pendingProperties.length} tone="bg-sky-100 text-sky-700" />
                <IconStat icon="✓" label="Approved Listings" value={approvedListings} tone="bg-emerald-100 text-emerald-700" />
                <IconStat icon="◌" label="Total Students" value={stats?.totalStudents ?? "—"} tone="bg-brand-100 text-brand-800" />
                <IconStat icon="⌂" label="Total Landlords" value={stats?.totalLandlords ?? "—"} tone="bg-fuchsia-100 text-fuchsia-700" />
                <IconStat icon="↳" label="Active Bookings" value={stats?.approvedBookings ?? "—"} tone="bg-slate-100 text-slate-700" />
            </div>

            {analytics && (
                <div className="grid gap-6 xl:grid-cols-2">
                    <SectionCard title="New listings trend" eyebrow="Analytics">
                        <MiniTrend data={analytics.listingsTrend} colorClassName="bg-brand-900" />
                    </SectionCard>
                    <SectionCard title="New bookings trend" eyebrow="Analytics">
                        <MiniTrend data={analytics.bookingsTrend} colorClassName="bg-emerald-600" />
                    </SectionCard>
                </div>
            )}
        </div>
    );
}

function MiniTrend({ data, colorClassName }: { data: { date: string; count: number }[]; colorClassName: string }) {
    const max = Math.max(...data.map((point) => point.count), 1);
    return (
        <div className="space-y-3">
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 xl:grid-cols-10">
                {data.slice(-10).map((point) => (
                    <div key={point.date} className="flex flex-col items-center gap-2">
                        <div className="flex h-40 w-full items-end rounded-[18px] bg-slate-50 p-2">
                            <div className={`w-full rounded-[14px] ${colorClassName}`} style={{ height: `${Math.max((point.count / max) * 100, point.count ? 8 : 4)}%` }} />
                        </div>
                        <span className="text-[11px] text-slate-500">{new Date(point.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ModerationTab() {
    const queryClient = useQueryClient();
    const addToast = useToastStore((state) => state.addToast);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [preview, setPreview] = useState<{ title: string; images: GalleryImage[]; initialIndex: number } | null>(null);
    const { data: pending = [], isLoading } = useQuery({ queryKey: ["admin-pending-properties"], queryFn: adminService.listPendingProperties });

    async function handleDecision(id: string, status: "APPROVED" | "REJECTED") {
        setProcessingId(id);
        try {
            const rejectionReason = status === "REJECTED" ? window.prompt("Reason for rejection:") ?? undefined : undefined;
            await adminService.moderateProperty(id, status, rejectionReason);
            queryClient.invalidateQueries({ queryKey: ["admin-pending-properties"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            addToast({ type: "success", title: status === "APPROVED" ? "Listing approved" : "Listing rejected", message: "The moderation decision has been saved." });
        } catch (error) {
            addToast({ type: "error", title: "Decision failed", message: getFriendlyErrorMessage(error) });
        } finally {
            setProcessingId(null);
        }
    }

    if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
    if (pending.length === 0) return <p className="text-sm text-slate-500">No listings awaiting review. 🎉</p>;

    return (
        <div className="grid gap-4 xl:grid-cols-2">
            {pending.map((property) => (
                <div key={property.id} className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
                    <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
                        <div className="space-y-2 p-4 sm:p-5">
                            <button
                                type="button"
                                onClick={() =>
                                    setPreview({
                                        title: property.title,
                                        images: property.images.map((image, index) => ({
                                            id: image.id,
                                            url: image.url,
                                            alt: `${property.title} image ${index + 1}`,
                                            label: `Image ${index + 1}`,
                                        })),
                                        initialIndex: 0,
                                    })
                                }
                                className="block w-full overflow-hidden rounded-[20px] bg-slate-100"
                            >
                                <div className="aspect-[4/3] bg-slate-100">
                                    {property.images[0] ? <img src={property.images[0].url} alt={property.title} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-slate-400">No image</div>}
                                </div>
                            </button>
                            {property.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {property.images.map((image, index) => (
                                        <button
                                            key={image.id}
                                            type="button"
                                            onClick={() =>
                                                setPreview({
                                                    title: property.title,
                                                    images: property.images.map((entry, entryIndex) => ({
                                                        id: entry.id,
                                                        url: entry.url,
                                                        alt: `${property.title} image ${entryIndex + 1}`,
                                                        label: `Image ${entryIndex + 1}`,
                                                    })),
                                                    initialIndex: index,
                                                })
                                            }
                                            className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-transparent bg-slate-100"
                                        >
                                            <img src={image.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="space-y-4 p-4 sm:p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-lg font-semibold text-slate-950">{property.title}</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {property.location} · {property.landlord?.firstName} {property.landlord?.lastName}
                                    </p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${listingStatusTone(property.status)}`}>{property.status}</span>
                            </div>
                            <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                <p>Price: ₦{property.price}</p>
                                <p>Rooms: {property.bedrooms} bed / {property.bathrooms} bath</p>
                                <p>Distance: {property.distanceFromCampusKm} km</p>
                                <p>Type: {property.roomType.replace("_", " ")}</p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row">
                                <button onClick={() => handleDecision(property.id, "APPROVED")} disabled={processingId === property.id} className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70">
                                    {processingId === property.id ? "Working…" : "Approve"}
                                </button>
                                <button onClick={() => handleDecision(property.id, "REJECTED")} disabled={processingId === property.id} className="rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-70">
                                    {processingId === property.id ? "Working…" : "Reject"}
                                </button>
                                <button onClick={() => adminService.removeFraudulentListing(property.id)} disabled={processingId === property.id} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-70">
                                    Remove fraud
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {preview && (
                <ImageGalleryViewer
                    images={preview.images}
                    open
                    initialIndex={preview.initialIndex}
                    title={preview.title}
                    onClose={() => setPreview(null)}
                />
            )}
        </div>
    );
}

function PeopleRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-sm font-semibold text-slate-900">{value}</p>
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
        <>
            <div className="grid gap-3 md:hidden">
                {data?.items.map((student) => (
                    <div key={student.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-base font-semibold text-slate-950">{student.firstName} {student.lastName}</p>
                                <p className="text-sm text-slate-500">{student.user.email}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${student.user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{student.user.isActive ? "active" : "inactive"}</span>
                        </div>
                        <div className="mt-3 space-y-2">
                            <PeopleRow label="University" value={student.university.name} />
                            <PeopleRow label="Joined" value={formatDay(student.user.createdAt)} />
                        </div>
                        <button onClick={() => toggleActive(student.id, student.user.isActive)} className="mt-4 w-full rounded-full bg-brand-900 px-4 py-3 text-sm font-semibold text-white">
                            {student.user.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                    </div>
                ))}
            </div>

            <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 bg-white md:block">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">University</th>
                            <th className="px-4 py-3">Joined</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.items.map((student) => (
                            <tr key={student.id} className="border-t border-slate-100">
                                <td className="px-4 py-4 font-medium text-slate-900">{student.firstName} {student.lastName}</td>
                                <td className="px-4 py-4 text-slate-600">{student.user.email}</td>
                                <td className="px-4 py-4 text-slate-600">{student.university.name}</td>
                                <td className="px-4 py-4 text-slate-600">{formatDay(student.user.createdAt)}</td>
                                <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${student.user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{student.user.isActive ? "active" : "inactive"}</span></td>
                                <td className="px-4 py-4 text-right"><button onClick={() => toggleActive(student.id, student.user.isActive)} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">{student.user.isActive ? "Deactivate" : "Reactivate"}</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
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
        <>
            <div className="grid gap-3 md:hidden">
                {data?.items.map((landlord) => (
                    <div key={landlord.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-base font-semibold text-slate-950">{landlord.businessName || `${landlord.firstName} ${landlord.lastName}`}</p>
                                <p className="text-sm text-slate-500">{landlord.user.email}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${landlord.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{landlord.isVerified ? "verified" : "pending"}</span>
                        </div>
                        <div className="mt-3 space-y-2">
                            <PeopleRow label="Listings" value={String(landlord._count.properties)} />
                            <PeopleRow label="Joined" value={formatDay(landlord.user.createdAt)} />
                        </div>
                        <button onClick={() => toggleActive(landlord.id, landlord.user.isActive)} className="mt-4 w-full rounded-full bg-brand-900 px-4 py-3 text-sm font-semibold text-white">
                            {landlord.user.isActive ? "Deactivate" : "Reactivate"}
                        </button>
                    </div>
                ))}
            </div>

            <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 bg-white md:block">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Listings</th>
                            <th className="px-4 py-3">Joined</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.items.map((landlord) => (
                            <tr key={landlord.id} className="border-t border-slate-100">
                                <td className="px-4 py-4 font-medium text-slate-900">{landlord.businessName || `${landlord.firstName} ${landlord.lastName}`}</td>
                                <td className="px-4 py-4 text-slate-600">{landlord.user.email}</td>
                                <td className="px-4 py-4 text-slate-600">{landlord._count.properties}</td>
                                <td className="px-4 py-4 text-slate-600">{formatDay(landlord.user.createdAt)}</td>
                                <td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${landlord.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{landlord.isVerified ? "verified" : "pending"}</span></td>
                                <td className="px-4 py-4 text-right"><button onClick={() => toggleActive(landlord.id, landlord.user.isActive)} className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">{landlord.user.isActive ? "Deactivate" : "Reactivate"}</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

function BookingsTab() {
    const { data, isLoading } = useQuery({ queryKey: ["admin-bookings"], queryFn: () => adminService.listBookings() });

    if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;

    return (
        <>
            <div className="grid gap-3 md:hidden">
                {data?.items.map((booking) => (
                    <div key={booking.id} className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-base font-semibold text-slate-950">{booking.property.title}</p>
                                <p className="text-sm text-slate-500">{booking.student.firstName} {booking.student.lastName}</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">{booking.status.toLowerCase()}</span>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">Move-in: {formatDay(booking.moveInDate)}</p>
                    </div>
                ))}
            </div>

            <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 bg-white md:block">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.18em] text-slate-500">
                        <tr>
                            <th className="px-4 py-3">Property</th>
                            <th className="px-4 py-3">Student</th>
                            <th className="px-4 py-3">Move-in</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.items.map((booking) => (
                            <tr key={booking.id} className="border-t border-slate-100">
                                <td className="px-4 py-4 font-medium text-slate-900">{booking.property.title}</td>
                                <td className="px-4 py-4 text-slate-600">{booking.student.firstName} {booking.student.lastName}</td>
                                <td className="px-4 py-4 text-slate-600">{formatDay(booking.moveInDate)}</td>
                                <td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">{booking.status.toLowerCase()}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

function VerificationCard({ item, onView, onApprove, onReject }: { item: VerificationRequest; onView: () => void; onApprove: () => void; onReject: () => void }) {
    const docs = [
        { label: "Government ID", url: item.idDocumentUrl },
        { label: "Selfie", url: item.selfieUrl },
        { label: "Proof of Ownership", url: item.proofOfOwnershipUrl },
    ].filter((document): document is { label: string; url: string } => Boolean(document.url));

    return (
        <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-brand-900 to-forest-800 text-lg font-bold text-white">
                        {getInitials(item.landlord?.firstName, item.landlord?.lastName, item.user?.email)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                                <h3 className="truncate text-lg font-semibold text-slate-950">{item.landlord?.businessName ?? `${item.landlord?.firstName ?? "Unknown"} ${item.landlord?.lastName ?? ""}`.trim()}</h3>
                                <p className="mt-1 text-sm text-slate-500">{item.user?.email ?? "Email unavailable"}</p>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1 ${statusTone(item.status)}`}>{item.status.replace("_", " ")}</span>
                        </div>
                        <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                            <p>Phone: Not provided</p>
                            <p>Business: {item.landlord?.businessName ?? "Not provided"}</p>
                            <p>Registered: {formatDay(item.createdAt)}</p>
                            <p>University: Not provided in current API</p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                    {docs.map((document) => (
                        <button key={document.label} type="button" onClick={onView} className="overflow-hidden rounded-[18px] border border-slate-200 bg-slate-100 text-left">
                            <div className="aspect-square bg-[linear-gradient(135deg,_#cbd5e1,_#f8fafc)]" />
                        </button>
                    ))}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button onClick={onView} className="rounded-full bg-brand-900 px-4 py-3 text-sm font-semibold text-white">
                        View details
                    </button>
                    <button onClick={onApprove} className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                        Approve
                    </button>
                    <button onClick={onReject} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                        Reject
                    </button>
                </div>
            </div>
        </article>
    );
}

function VerificationDetailsModal({ item, onClose, onApprove, onReject, onOpenDocument }: { item: VerificationRequest; onClose: () => void; onApprove: () => void; onReject: () => void; onOpenDocument: (label: string, url: string) => void }) {
    const docs = [
        { label: "Government ID", url: item.idDocumentUrl },
        { label: "Selfie", url: item.selfieUrl },
        { label: "Proof of Ownership", url: item.proofOfOwnershipUrl },
    ].filter((document): document is { label: string; url: string } => Boolean(document.url));

    return (
        <Dialog
            title="Verification details"
            description="Review the landlord, inspect each document, and approve or reject without leaving the dashboard."
            onClose={onClose}
            footer={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <button type="button" onClick={onReject} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                        Reject
                    </button>
                    <button type="button" onClick={onApprove} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
                        Approve
                    </button>
                </div>
            }
        >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
                <div className="space-y-4">
                    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                        <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-brand-900 to-forest-800 text-lg font-bold text-white">
                                {getInitials(item.landlord?.firstName, item.landlord?.lastName, item.user?.email)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-xl font-semibold text-slate-950">{item.landlord?.businessName ?? `${item.landlord?.firstName ?? "Unknown"} ${item.landlord?.lastName ?? ""}`.trim()}</h3>
                                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ring-1 ${statusTone(item.status)}`}>{item.status.replace("_", " ")}</span>
                                </div>
                                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                    <p><span className="font-semibold text-slate-900">Email:</span> {item.user?.email ?? "Not available"}</p>
                                    <p><span className="font-semibold text-slate-900">Phone:</span> Not provided in current API</p>
                                    <p><span className="font-semibold text-slate-900">Business:</span> {item.landlord?.businessName ?? "Not provided"}</p>
                                    <p><span className="font-semibold text-slate-900">University:</span> Not provided in current API</p>
                                    <p><span className="font-semibold text-slate-900">Registration date:</span> {formatDate(item.createdAt)}</p>
                                    <p><span className="font-semibold text-slate-900">Property count:</span> Not provided in current API</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Uploaded documents</p>
                        <div className="mt-4 space-y-3">
                            <ThumbnailStrip documents={docs} onOpen={onOpenDocument} />
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Verification history</p>
                        <div className="mt-4 space-y-3">
                            <HistoryRow label="Submitted" value={formatDate(item.createdAt)} tone="bg-sky-100 text-sky-700" />
                            <HistoryRow label="Last updated" value={formatDate(item.reviewedAt ?? item.createdAt)} tone="bg-brand-100 text-brand-800" />
                            <HistoryRow label="Ownership confirmation" value={item.submitterConfirmation ? "Confirmed by landlord" : "Not confirmed"} tone={item.submitterConfirmation ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"} />
                            <HistoryRow label="Admin notes" value={item.adminNotes ?? "No notes yet"} tone="bg-slate-100 text-slate-700" />
                        </div>
                    </div>
                </div>

                <aside className="space-y-4">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-4 text-white">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Fast summary</p>
                        <div className="mt-4 grid gap-3 text-sm text-white/85">
                            <p><span className="text-white/60">Submission date:</span> {formatDate(item.createdAt)}</p>
                            <p><span className="text-white/60">Last updated:</span> {formatDate(item.reviewedAt)}</p>
                            <p><span className="text-white/60">Status:</span> {item.status.replace("_", " ")}</p>
                            <p><span className="text-white/60">Ownership confirmed:</span> {item.submitterConfirmation ? "Yes" : "No"}</p>
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Review controls</p>
                        <div className="mt-3 space-y-3 text-sm text-slate-600">
                            <p>Approvals and rejections reuse the existing API routes and keep the current backend behavior intact.</p>
                            <p>Rejections require a reason so the note is preserved in the database.</p>
                        </div>
                        <div className="mt-4 flex flex-col gap-2">
                            <button type="button" onClick={onApprove} className="rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white">
                                Approve verification
                            </button>
                            <button type="button" onClick={onReject} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                                Reject verification
                            </button>
                        </div>
                    </div>
                </aside>
            </div>
        </Dialog>
    );
}

function VerificationTab() {
    const queryClient = useQueryClient();
    const addToast = useToastStore((state) => state.addToast);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [documentModal, setDocumentModal] = useState<{ label: string; url: string } | null>(null);
    const [decisionMode, setDecisionMode] = useState<DecisionMode>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const { data: verifications = [], isLoading } = useQuery({ queryKey: ["admin-verifications"], queryFn: verificationService.listForAdmin });
    const { data: selectedVerification } = useQuery({ queryKey: ["admin-verification", selectedId], queryFn: () => verificationService.getById(selectedId ?? ""), enabled: Boolean(selectedId) });

    const activeVerification = selectedVerification ?? verifications.find((item) => item.id === selectedId) ?? null;

    async function confirmDecision(note: string) {
        if (!activeVerification || !decisionMode) return;

        setProcessingId(activeVerification.id);
        try {
            if (decisionMode === "reject") {
                await verificationService.reject(activeVerification.id, note);
                addToast({ type: "success", title: "Verification rejected", message: "The rejection reason was saved." });
            } else {
                await verificationService.approve(activeVerification.id, note || undefined);
                addToast({ type: "success", title: "Verification approved", message: "The approval note was saved." });
            }
            queryClient.invalidateQueries({ queryKey: ["admin-verifications"] });
            queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
            setDecisionMode(null);
            setSelectedId(null);
        } catch (error) {
            addToast({ type: "error", title: "Decision failed", message: getFriendlyErrorMessage(error) });
        } finally {
            setProcessingId(null);
        }
    }

    if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;

    return (
        <div className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
                {verifications.map((item) => (
                    <VerificationCard
                        key={item.id}
                        item={item}
                        onView={() => setSelectedId(item.id)}
                        onApprove={() => {
                            setSelectedId(item.id);
                            setDecisionMode("approve");
                        }}
                        onReject={() => {
                            setSelectedId(item.id);
                            setDecisionMode("reject");
                        }}
                    />
                ))}
            </div>

            {activeVerification && selectedId && !decisionMode && (
                <VerificationDetailsModal
                    item={activeVerification}
                    onClose={() => setSelectedId(null)}
                    onApprove={() => setDecisionMode("approve")}
                    onReject={() => setDecisionMode("reject")}
                    onOpenDocument={(label, url) => setDocumentModal({ label, url })}
                />
            )}

            {activeVerification && decisionMode && (
                <VerificationDecisionModal
                    mode={decisionMode}
                    item={activeVerification}
                    onClose={() => setDecisionMode(null)}
                    onConfirm={confirmDecision}
                    isSubmitting={processingId === activeVerification.id}
                />
            )}

            {documentModal && <DocumentViewerModal title={documentModal.label} url={documentModal.url} onClose={() => setDocumentModal(null)} />}
        </div>
    );
}

function TabContent({ tab }: { tab: Tab }) {
    if (tab === "overview") return <OverviewTab />;
    if (tab === "moderation") return <ModerationTab />;
    if (tab === "students") return <StudentsTab />;
    if (tab === "landlords") return <LandlordsTab />;
    if (tab === "bookings") return <BookingsTab />;
    return <VerificationTab />;
}

export default function AdminDashboard() {
    const [tab, setTab] = useState<Tab>("overview");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
            <SidebarNav activeTab={tab} onChange={setTab} collapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((current) => !current)} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

            <div className="min-w-0 flex-1">
                <PageHeader onMenu={() => setMobileOpen(true)} activeTab={tab} isCollapsed={sidebarCollapsed} onToggleCollapsed={() => setSidebarCollapsed((current) => !current)} />

                <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
                    <div className="page-transition space-y-6">
                        <TabContent tab={tab} />
                    </div>
                </main>
            </div>
        </div>
    );
}
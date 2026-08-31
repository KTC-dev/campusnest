import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notification.service";
import { useAuthStore } from "@/store/authStore";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function navigateForNotification(type: string, actionUrl?: string | null) {
  if (actionUrl) return actionUrl;
  switch (type) {
    case "MESSAGE":
      return "/conversations";
    case "BOOKING_UPDATE":
    case "PROPERTY_INQUIRY":
    case "INSPECTION_CONFIRMED":
      return "/dashboard";
    case "LISTING_STATUS":
    case "PROPERTY_APPROVED":
      return "/dashboard/listings";
    case "ROOMMATE_MATCH":
    case "ROOMMATE_MATCH_REQUEST":
    case "ROOMMATE_MATCH_ACCEPTED":
    case "ROOMMATE_MATCH_DECLINED":
      return "/roommates";
    case "VERIFICATION_APPROVED":
      return "/verification";
    case "SECURITY_ALERT":
    case "ACCOUNT_WARNING":
      return "/settings";
    default:
      return "/";
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list,
    refetchInterval: 30_000,
    enabled: Boolean(user),
  });

  async function handleOpen() {
    setOpen((o) => !o);
    if (!open && data?.unreadCount) {
      await notificationService.markAllRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  }

  async function handleNotificationClick(notification: { id: string; type: string; actionUrl?: string | null }) {
    await notificationService.markRead(notification.id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    setOpen(false);
    const target = navigateForNotification(notification.type, notification.actionUrl);
    navigate(target);
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    await notificationService.delete(id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleOpen}
        className="relative flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-text.secondary transition hover:border-brand-200 active:scale-95"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7 3 9 3 9h6s3-2 3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        {data && data.unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1.5 text-[10px] font-bold text-white">
            {data.unreadCount > 9 ? "9+" : data.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-card border border-border bg-card shadow-soft-lg z-20" role="menu" aria-label="Notifications">
          {!data || data.notifications.length === 0 ? (
            <div className="p-4 text-sm text-text.secondary">No notifications yet.</div>
          ) : (
            data.notifications.map((n) => (
              <div
                key={n.id}
                className={`border-b border-border p-3 last:border-b-0 cursor-pointer transition hover:bg-cream-50 ${!n.readAt ? "bg-primary-600/5" : ""}`}
                role="menuitem"
                onClick={() => handleNotificationClick(n)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text.primary">{n.title}</p>
                    <p className="mt-0.5 text-xs text-text.secondary line-clamp-2">{n.body}</p>
                    <p className="mt-1 text-[10px] text-text.secondary">{timeAgo(n.createdAt)}</p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, n.id)}
                    className="shrink-0 text-text.secondary hover:text-error text-xs px-1.5 py-0.5 rounded"
                    aria-label="Dismiss notification"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { notificationService } from "@/services/notification.service";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

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

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list,
    enabled: Boolean(user),
  });

  async function handleMarkRead(id: string) {
    await notificationService.markRead(id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  async function handleMarkAllRead() {
    await notificationService.markAllRead();
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  async function handleDelete(id: string) {
    await notificationService.delete(id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  async function handleNotificationClick(notification: { id: string; type: string; actionUrl?: string | null; readAt?: string | null }) {
    if (!notification.readAt) {
      await notificationService.markRead(notification.id);
    }
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    const target = navigateForNotification(notification.type, notification.actionUrl);
    navigate(target);
  }

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="page-enter space-y-6 p-4 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text.primary">Notifications</h1>
          <p className="mt-1 text-sm text-text.secondary">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading && (
        <Card variant="outlined" padding="lg">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-cream-100" />
            ))}
          </div>
        </Card>
      )}

      {isError && (
        <Card variant="outlined" padding="lg">
          <EmptyState
            icon={<span className="text-2xl">⚠️</span>}
            title="Couldn't load notifications"
            description="Something went wrong while fetching your notifications. Please check your connection and try again."
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        </Card>
      )}

      {!isLoading && !isError && notifications.length === 0 && (
        <Card variant="outlined" padding="lg">
          <EmptyState
            icon={<span className="text-3xl">🔔</span>}
            title="No notifications yet"
            description="When you get updates about bookings, messages, or listings, they will show up here."
          />
        </Card>
      )}

      {!isLoading && !isError && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              variant={n.readAt ? "default" : "strong"}
              padding="md"
              className={`cursor-pointer transition hover:shadow-soft ${!n.readAt ? "border-l-4 border-l-primary-500" : ""}`}
              onClick={() => handleNotificationClick(n)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text.primary">{n.title}</p>
                    {n.isSecurity && (
                      <span className="rounded-full bg-error/10 px-2 py-0.5 text-[10px] font-semibold text-error">SECURITY</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-text.secondary line-clamp-2">{n.body}</p>
                  <p className="mt-1.5 text-[10px] text-text.secondary">{timeAgo(n.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!n.readAt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                      className="text-[10px]"
                    >
                      Read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                    className="text-error text-[10px]"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

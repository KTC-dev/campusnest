import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list,
    refetchInterval: 30_000,
  });

  async function handleOpen() {
    setOpen((o) => !o);
    if (!open && data?.unreadCount) {
      await notificationService.markAllRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  }

  return (
    <div className="relative">
      <button onClick={handleOpen} className="relative rounded-full p-2 hover:bg-slate-100" aria-label="Notifications">
        🔔
        {data && data.unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
            {data.unreadCount > 9 ? "9+" : data.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl border border-slate-100 bg-white shadow-lg z-20">
          {!data || data.notifications.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No notifications yet.</p>
          ) : (
            data.notifications.map((n) => (
              <div key={n.id} className={`border-b border-slate-50 p-3 ${!n.readAt ? "bg-brand-50/40" : ""}`}>
                <p className="text-sm font-medium text-slate-900">{n.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                <p className="text-[10px] text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

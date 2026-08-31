import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { accommodationRequestService } from "@/services/accommodation-request.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

export default function MyAccommodationRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["accommodation-requests", "mine"],
    queryFn: () => accommodationRequestService.listMine({ pageSize: 20 }),
    enabled: Boolean(user),
  });

  async function handleDelete(id: string) {
    await accommodationRequestService.delete(id);
    addToast({ type: "success", title: "Request removed", message: "Your accommodation request has been deleted." });
    queryClient.invalidateQueries({ queryKey: ["accommodation-requests"] });
  }

  const requests = data?.requests ?? [];

  return (
    <StudentMobileShell>
      <div className="page-enter space-y-4 p-4 pb-28">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-text.primary">My requests</h1>
            <p className="mt-1 text-sm text-text.secondary">Track your accommodation requests and responses.</p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate("/accommodation-requests/new")}>
            New request
          </Button>
        </div>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} variant="outlined" padding="md"><div className="h-16 animate-pulse rounded-xl bg-cream-100" /></Card>
            ))}
          </div>
        )}

        {isError && (
          <Card variant="outlined" padding="lg">
            <EmptyState
              icon={<span className="text-2xl">⚠️</span>}
              title="Couldn't load requests"
              description="Something went wrong. Please try again."
              actionLabel="Retry"
              onAction={() => refetch()}
            />
          </Card>
        )}

        {!isLoading && !isError && requests.length === 0 && (
          <Card variant="outlined" padding="lg">
            <EmptyState
              icon={<span className="text-3xl">🏠</span>}
              title="No requests yet"
              description="Post an accommodation request and agents will respond with matching properties."
              actionLabel="Create request"
              onAction={() => navigate("/accommodation-requests/new")}
            />
          </Card>
        )}

        {!isLoading && !isError && requests.length > 0 && (
          <div className="space-y-3">
            {requests.map((request) => (
              <Card key={request.id} variant="strong" padding="md" className="border border-border/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-text.primary">{request.preferredLocation}</p>
                      <Badge variant={request.status === "OPEN" ? "brand" : request.status === "IN_PROGRESS" ? "warning" : "neutral"} size="sm">
                        {request.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-text.secondary">
                      {request.roomType.replace(/_/g, " ").toLowerCase()} • {request.university?.name}
                    </p>
                    <p className="mt-1 text-xs text-text.secondary">
                      {request.budgetMin && request.budgetMax ? `₦${Number(request.budgetMin).toLocaleString()} – ₦${Number(request.budgetMax).toLocaleString()}` : "Budget not specified"}
                    </p>
                    <p className="mt-1 text-[10px] text-text.secondary">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(request.id)} className="text-error text-xs">
                    Remove
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentMobileShell>
  );
}

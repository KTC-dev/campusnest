import { useQuery } from "@tanstack/react-query";
import { AgentMobileShell } from "@/components/AgentMobileShell";
import { accommodationRequestService } from "@/services/accommodation-request.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

export default function AgentRequestsPage() {
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["accommodation-requests", "open"],
    queryFn: () => accommodationRequestService.listOpen({ pageSize: 20 }),
    enabled: Boolean(user),
  });

  async function handleRespond(_requestId: string) {
    addToast({ type: "info", title: "Coming soon", message: "Agent responses will be available in a future update." });
  }

  const requests = data?.requests ?? [];

  return (
    <AgentMobileShell>
      <div className="page-enter space-y-4 p-4 pb-28">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text.primary">Student requests</h1>
          <p className="mt-1 text-sm text-text.secondary">Browse accommodation requests from students and respond with matching properties.</p>
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
              title="No open requests"
              description="There are no open accommodation requests matching your criteria right now."
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
                      <Badge variant={request.status === "OPEN" ? "brand" : "warning"} size="sm">{request.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-text.secondary">
                      {request.roomType.replace(/_/g, " ").toLowerCase()} • {request.genderPreference === "ANY" ? "Any gender" : request.genderPreference.toLowerCase()} • {request.university?.name}
                    </p>
                    <p className="mt-1 text-xs text-text.secondary">
                      {request.budgetMin && request.budgetMax ? "N" + Number(request.budgetMin).toLocaleString() + " – N" + Number(request.budgetMax).toLocaleString() : "Budget not specified"}
                    </p>
                    {request.additionalNotes && (
                      <p className="mt-1 text-xs text-text.secondary line-clamp-2">{request.additionalNotes}</p>
                    )}
                    <p className="mt-1 text-[10px] text-text.secondary">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => handleRespond(request.id)}>
                    Respond
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AgentMobileShell>
  );
}
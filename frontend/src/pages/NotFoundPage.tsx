import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Card variant="outlined" padding="lg" className="animate-fadeUp">
        <EmptyState
          icon={
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
          title="Page not found"
          description="The page you're looking for doesn't exist or has been moved."
          actionLabel="Back home"
          onAction={() => {}}
        />
      </Card>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { reviewService } from "@/services/review.service";
import { StarRating } from "@/components/ui/StarRating";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Review } from "@/types";

interface ReviewListProps {
  propertyId: string;
}

export function ReviewList({ propertyId }: ReviewListProps) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reviews", propertyId],
    queryFn: () => reviewService.getForProperty(propertyId),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} variant="outlined" padding="md">
            <div className="h-16 animate-pulse rounded-xl bg-cream-100" />
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Card variant="outlined" padding="lg">
        <EmptyState
          icon={<span className="text-2xl">⚠️</span>}
          title="Couldn't load reviews"
          description="Something went wrong while fetching reviews."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </Card>
    );
  }

  const reviews = data?.reviews ?? [];
  const averageRating = data?.averageRating ?? 0;
  const totalReviews = data?.total ?? 0;

  return (
    <div className="space-y-4">
      {totalReviews > 0 && (
        <div className="flex items-center gap-3">
          <StarRating rating={averageRating} readonly size="lg" showValue />
          <span className="text-sm text-text.secondary">{totalReviews} review{totalReviews === 1 ? "" : "s"}</span>
        </div>
      )}

      {reviews.length === 0 ? (
        <Card variant="outlined" padding="lg">
          <EmptyState
            icon={<span className="text-3xl">⭐</span>}
            title="No reviews yet"
            description="Be the first to review this property after your stay."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review: Review) => (
            <Card key={review.id} variant="outlined" padding="md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text.primary">
                      {review.student?.firstName} {review.student?.lastName}
                    </p>
                    <StarRating rating={review.rating} readonly size="sm" />
                  </div>
                  {review.comment && <p className="mt-1.5 text-sm text-text.secondary">{review.comment}</p>}
                  {review.agentResponse && (
                    <div className="mt-2 rounded-xl bg-emerald-50 p-2.5">
                      <p className="text-xs font-semibold text-emerald-700">Agent response</p>
                      <p className="mt-0.5 text-xs text-slate-700">{review.agentResponse}</p>
                    </div>
                  )}
                  <p className="mt-1.5 text-[10px] text-text.secondary">{new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

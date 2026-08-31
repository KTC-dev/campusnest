import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { reviewService } from "@/services/review.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { getFriendlyErrorMessage } from "@/utils/error";

interface ReviewFormProps {
  propertyId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment?: string;
    agentResponse?: string;
  } | null;
  onSuccess?: () => void;
}

export function ReviewForm({ propertyId, existingReview, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const user = useAuthStore((s) => s.user);

  const mutation = useMutation({
    mutationFn: () =>
      existingReview
        ? reviewService.update(existingReview.id, { rating, comment })
        : reviewService.create({ propertyId, rating, comment }),
    onSuccess: () => {
      addToast({ type: "success", title: existingReview ? "Review updated" : "Review submitted", message: "Thank you for your feedback." });
      queryClient.invalidateQueries({ queryKey: ["reviews", propertyId] });
      queryClient.invalidateQueries({ queryKey: ["reviews", "my"] });
      onSuccess?.();
    },
    onError: (error) => addToast({ type: "error", title: "Review failed", message: getFriendlyErrorMessage(error) }),
  });

  if (!user) {
    return <p className="text-sm text-text.secondary">Please log in to leave a review.</p>;
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Your rating</label>
        <StarRating rating={rating} onRatingChange={setRating} size="md" showValue />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-primary">Your review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience living at this property..."
          className="w-full rounded-2xl border bg-cream-50 px-4 py-3 text-sm text-text.primary placeholder:text-text-secondary/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border-border hover:border-primary-500/30"
        />
      </div>

      {existingReview?.agentResponse && (
        <div className="rounded-2xl bg-emerald-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Agent response</p>
          <p className="mt-1 text-sm text-slate-700">{existingReview.agentResponse}</p>
        </div>
      )}

      <Button
        variant="primary"
        size="md"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || rating === 0}
        loading={mutation.isPending}
      >
        {existingReview ? "Update review" : "Submit review"}
      </Button>
    </div>
  );
}

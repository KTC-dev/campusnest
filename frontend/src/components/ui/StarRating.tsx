interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

const SIZE_CLASSES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function StarRating({ rating, onRatingChange, readonly = false, size = "md", showValue = false }: StarRatingProps) {
  const sizeClass = SIZE_CLASSES[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly || !onRatingChange}
          onClick={() => onRatingChange?.(star)}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <svg
            viewBox="0 0 20 20"
            fill={star <= rating ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className={`${sizeClass} ${star <= rating ? "text-amber-400" : "text-gray-300"}`}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
      {showValue && <span className="ml-1 text-sm font-medium text-text.primary">{rating.toFixed(1)}</span>}
    </div>
  );
}

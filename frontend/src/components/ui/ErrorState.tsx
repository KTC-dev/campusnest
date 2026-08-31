import React from "react";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We couldn't load this content. Please check your connection and try again.",
  retryLabel = "Try again",
  onRetry,
  className = "",
}) => {
  return (
    <div className={["flex flex-col items-center justify-center px-6 py-16 text-center", className].join(" ")}>
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-error/10 text-error" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="mb-2 font-display text-xl font-semibold text-text-primary">{title}</h3>
      <p className="max-w-sm text-base text-text-secondary">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="primary" className="mt-6">
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;

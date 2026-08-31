import React from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div className={["flex flex-col items-center justify-center px-6 py-16 text-center", className].join(" ")}>
      {icon && (
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-cream-100 text-4xl" aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className="mb-2 font-display text-xl font-semibold text-text-primary">{title}</h3>
      {description && <p className="max-w-sm text-base text-text-secondary">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-6" variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;

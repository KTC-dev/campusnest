import React from "react";

type BadgeVariant = "success" | "warning" | "error" | "neutral" | "brand";
type BadgeSize = "sm" | "md";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success/10 text-green-800 ring-green-600/20",
  warning: "bg-warning/10 text-amber-800 ring-amber-600/20",
  error: "bg-error/10 text-red-800 ring-red-600/20",
  neutral: "bg-cream-200 text-text-secondary ring-border",
  brand: "bg-primary-600/10 text-primary-700 ring-primary-600/20",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2.5 py-0.5 text-xs",
  md: "px-3 py-1 text-sm",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "brand",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full font-medium ring-1 ring-inset",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;

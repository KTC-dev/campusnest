import React from "react";

type CardVariant = "default" | "elevated" | "outlined" | "strong" | "hero";
type CardPadding = "sm" | "md" | "lg";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverLift?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: "premium-card",
  elevated: "premium-card-elevated",
  outlined: "premium-card-outlined",
  strong: "premium-card-strong",
  hero: "rounded-hero-lg bg-card shadow-premium-lg border-0",
};

const paddingClasses: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export const Card: React.FC<CardProps> = ({
  variant = "default",
  padding = "md",
  hoverLift = false,
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={[
        variantClasses[variant],
        paddingClasses[padding],
        hoverLift ? "premium-card-hover" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

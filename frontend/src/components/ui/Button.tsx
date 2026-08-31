import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-brand active:bg-primary-800 active:shadow-brand-lg transition-all duration-200",
  secondary: "bg-cream-100 text-text-primary hover:bg-cream-200 hover:shadow-soft active:bg-cream-200 border border-border transition-all duration-200",
  ghost: "bg-transparent text-primary-600 hover:bg-primary-600/10 active:bg-primary-600/15 active:scale-[0.98] transition-all duration-200",
  danger: "bg-error text-white hover:bg-red-600 hover:shadow-brand active:bg-red-700 active:shadow-brand-lg transition-all duration-200",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-11 px-4 text-sm rounded-xl",
  md: "h-12 px-5 text-base rounded-2xl",
  lg: "h-14 px-6 text-lg rounded-2xl",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  disabled,
  ...props
}) => {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 tap-press focus-ring",
        "min-h-12 disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && (
        <span
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      )}
      {!loading && leftIcon && <span className="flex-shrink-0" aria-hidden="true">{leftIcon}</span>}
      <span className="truncate">{children}</span>
      {!loading && rightIcon && <span className="flex-shrink-0" aria-hidden="true">{rightIcon}</span>}
    </button>
  );
};

export default Button;

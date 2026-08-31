import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const errorId = `${inputId}-error`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error || undefined}
            aria-describedby={error ? errorId : undefined}
            className={[
              "w-full rounded-2xl border bg-cream-50 px-4 py-3 text-text-primary placeholder:text-text-secondary/60",
              "transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
              error
                ? "border-error focus:ring-error focus:border-error"
                : "border-border hover:border-primary-500/30",
              leftIcon ? "pl-10" : "",
              rightIcon ? "pr-10" : "",
              "min-h-12",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />
          {rightIcon && (
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

import React from "react";

type SkeletonVariant = "text" | "circle" | "rectangle" | "card";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  label?: string;
}

const variantClasses: Record<SkeletonVariant, string> = {
  text: "rounded-lg h-4 w-full",
  circle: "rounded-full",
  rectangle: "rounded-xl",
  card: "rounded-card",
};

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = "text",
  width,
  height,
  className = "",
  label,
  ...props
}) => {
  const style: React.CSSProperties = {
    width: width ?? "100%",
    height: height ?? (variant === "text" ? "1rem" : variant === "circle" ? "2.5rem" : "6rem"),
  };

  if (width !== undefined) {
    style.width = typeof width === "number" ? `${width}px` : width;
  }
  if (height !== undefined) {
    style.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <div
      className={["shimmer", variantClasses[variant], className].filter(Boolean).join(" ")}
      style={style}
      role="status"
      aria-busy="true"
      aria-label={label || "Loading"}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Skeleton;

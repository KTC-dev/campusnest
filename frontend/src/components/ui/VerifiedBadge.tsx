interface VerifiedBadgeProps {
  size?: 16 | 20 | 24 | 32;
  className?: string;
  showText?: boolean;
}

const SIZE_CLASSES: Record<number, { icon: string; text: string }> = {
  16: { icon: "h-4 w-4", text: "text-xs" },
  20: { icon: "h-5 w-5", text: "text-sm" },
  24: { icon: "h-6 w-6", text: "text-sm" },
  32: { icon: "h-8 w-8", text: "text-base" },
};

export function VerifiedBadge({ size = 20, className = "", showText = false }: VerifiedBadgeProps) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES[20];

  if (showText) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700 ${className}`} title="Edurus Verified — identity and documents verified by Edurus. This does not guarantee safety or ownership.">
        <img
          src="/verified-shield.svg"
          alt="Verified by EduRus"
          aria-label="Verified by EduRus"
          className={`inline-flex shrink-0 select-none ${sizeClass.icon}`}
          draggable={false}
        />
        <span className={`font-semibold ${sizeClass.text}`}>Edurus Verified</span>
      </span>
    );
  }

  return (
    <img
      src="/verified-shield.svg"
      alt="Verified by EduRus"
      aria-label="Verified by EduRus"
      title="Edurus Verified — identity and documents verified by Edurus. This does not guarantee safety or ownership."
      className={`inline-flex shrink-0 select-none ${sizeClass.icon} ${className}`}
      draggable={false}
    />
  );
}

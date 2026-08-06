interface VerifiedBadgeProps {
    size?: 16 | 20 | 24 | 32;
    className?: string;
}

const SIZE_CLASSES: Record<number, string> = {
    16: "h-4 w-4",
    20: "h-5 w-5",
    24: "h-6 w-6",
    32: "h-8 w-8",
};

export function VerifiedBadge({ size = 20, className = "" }: VerifiedBadgeProps) {
    const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES[20];

    return (
        <img
            src="/verified-shield.svg"
            alt="Verified by EduRus"
            aria-label="Verified by EduRus"
            title="Verified by EduRus"
            className={`inline-flex shrink-0 select-none ${sizeClass} ${className}`}
            draggable={false}
        />
    );
}
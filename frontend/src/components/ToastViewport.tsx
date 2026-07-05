import { useToastStore } from "@/store/toastStore";

const iconMap = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "•",
} as const;

const toneMap = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-slate-200 bg-white text-slate-700",
} as const;

export function ToastViewport() {
    const toasts = useToastStore((state) => state.toasts);
    const removeToast = useToastStore((state) => state.removeToast);

    if (toasts.length === 0) return null;

    return (
        <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,24rem)] flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg transition-all ${toneMap[toast.type]}`}
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-start gap-3">
                        <span className="mt-0.5 text-lg font-semibold">{iconMap[toast.type]}</span>
                        <div className="flex-1">
                            <p className="text-sm font-semibold">{toast.title}</p>
                            {toast.message ? <p className="mt-1 text-sm opacity-90">{toast.message}</p> : null}
                        </div>
                        <button
                            type="button"
                            onClick={() => removeToast(toast.id)}
                            className="text-sm font-semibold opacity-80 transition hover:opacity-100"
                            aria-label="Dismiss notification"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

import { create } from "zustand";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastState {
    toasts: ToastItem[];
    addToast: (toast: Omit<ToastItem, "id">) => void;
    removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const entry = { ...toast, id, duration: toast.duration ?? 4000 };
        set((state) => ({ toasts: [...state.toasts, entry] }));

        if (entry.duration && entry.duration > 0) {
            window.setTimeout(() => {
                set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) }));
            }, entry.duration);
        }
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((item) => item.id !== id) })),
}));

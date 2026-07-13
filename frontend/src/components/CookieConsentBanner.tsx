import { useEffect, useState } from "react";

const STORAGE_KEY = "edurus-cookie-consent";

type ConsentChoice = "accepted" | "rejected";

export function CookieConsentBanner() {
    const [, setConsent] = useState<ConsentChoice | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === "accepted" || saved === "rejected") {
            setConsent(saved);
            setIsVisible(false);
            return;
        }

        setConsent(null);
        setIsVisible(true);
    }, []);

    function persist(choice: ConsentChoice) {
        window.localStorage.setItem(STORAGE_KEY, choice);
        setConsent(choice);
        setIsVisible(false);
    }

    if (!isVisible) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-8px_40px_rgba(15,23,42,0.12)] backdrop-blur sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                    <p className="text-sm font-semibold text-slate-900">We respect your privacy</p>
                    <p className="mt-1 text-sm text-slate-600">
                        Edurus uses essential cookies to keep the platform secure and remember your session. You can choose to allow optional preferences, but we do not use tracking cookies for advertising.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => persist("rejected")}
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                    >
                        Reject optional
                    </button>
                    <button
                        type="button"
                        onClick={() => persist("accepted")}
                        className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                    >
                        Accept preferences
                    </button>
                </div>
            </div>
        </div>
    );
}

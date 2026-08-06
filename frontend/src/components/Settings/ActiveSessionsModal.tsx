import { useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToastStore } from "@/store/toastStore";

export function ActiveSessionsModal({ onClose }: { onClose: () => void }) {
    const addToast = useToastStore((s) => s.addToast);

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    function signOutOthers() {
        // placeholder: real API would revoke other sessions
        addToast({ type: "success", title: "Signed out", message: "Other sessions were signed out." });
        onClose();
    }

    const sessions = [
        { id: "s1", device: "Chrome — Windows", lastSeen: "Just now" },
        { id: "s2", device: "Safari — iPhone", lastSeen: "2 days ago" },
    ];

    return (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-text.primary/40 px-4" onClick={onClose}>
            <Card variant="default" padding="lg" className="w-full max-w-sm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <h2 className="font-display text-lg font-semibold text-text.primary">Active sessions</h2>
                <p className="mt-1 text-sm text-text.secondary">Sign out other devices or review active sessions.</p>

                <div className="mt-4 space-y-3">
                    {sessions.map((s) => (
                        <div key={s.id} className="flex items-center justify-between rounded-2xl border border-border p-3">
                            <div>
                                <p className="text-sm font-medium text-text.primary">{s.device}</p>
                                <p className="mt-1 text-xs text-text.secondary">Last seen {s.lastSeen}</p>
                            </div>
                            <Button variant="secondary" size="sm" onClick={() => addToast({ type: "info", title: "Signed out", message: `Signed out ${s.device}` })}>
                                Sign out
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex gap-2">
                    <Button variant="secondary" size="md" fullWidth onClick={onClose}>Close</Button>
                    <Button variant="danger" size="md" fullWidth onClick={signOutOthers}>Sign out other devices</Button>
                </div>
            </Card>
        </div>
    );
}

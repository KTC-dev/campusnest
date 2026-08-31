import { FormEvent, useState, useEffect, useRef } from "react";
import { bookingService } from "@/services/booking.service";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface BookingRequestModalProps {
  propertyId: string;
  propertyTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function BookingRequestModal({ propertyId, propertyTitle, onClose, onSuccess }: BookingRequestModalProps) {
  const [moveInDate, setMoveInDate] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await bookingService.create(propertyId, moveInDate, message || undefined);
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Couldn't send your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-text.primary/40 px-4" onClick={onClose}>
      <Card variant="default" padding="lg" className="w-full max-w-sm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
        <h2 id="booking-modal-title" className="font-display text-lg font-semibold text-text.primary">Request to book</h2>
        <p className="mt-1 text-sm text-text.secondary">{propertyTitle}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <Input label="Preferred move-in date" type="date" required min={new Date().toISOString().split("T")[0]} value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} />
          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Message (optional)</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Anything the agent should know?"
              className="mt-1.5 h-24 w-full rounded-card border border-border bg-cream-50 px-4 py-3 text-sm text-text.primary outline-none transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20 placeholder:text-text.secondary/60"
            />
          </div>

          {error && <p className="text-sm text-error" role="alert">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" size="md" fullWidth type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="md" fullWidth type="submit" disabled={isSubmitting} loading={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send request"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

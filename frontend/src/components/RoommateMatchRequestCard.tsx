import { useState } from "react";
import { RoommateMatchRequest } from "@/types";
import { roommateService } from "@/services/roommate.service";
import { useToastStore } from "@/store/toastStore";
import { getFriendlyErrorMessage } from "@/utils/error";

interface RoommateMatchRequestCardProps {
  request: RoommateMatchRequest;
  onRequestUpdated?: () => void;
}

function scoreColor(score: number) {
  if (score >= 80) return "bg-emerald-100 text-emerald-700";
  if (score >= 60) return "bg-brand-100 text-brand-700";
  if (score >= 40) return "bg-amber-100 text-amber-700";
  return "bg-slate-200 text-slate-600";
}

export function RoommateMatchRequestCard({ request, onRequestUpdated }: RoommateMatchRequestCardProps) {
  const [isResponding, setIsResponding] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const { sender, status, message } = request;

  const handleRespond = async (accept: boolean) => {
    setIsResponding(true);
    try {
      await roommateService.respondToMatchRequest(request.id, accept);
      addToast({
        type: "success",
        title: accept ? "Match accepted!" : "Match declined",
        message: accept ? "You can now message this student." : "You declined this match request.",
      });
      onRequestUpdated?.();
    } catch (error) {
      addToast({ type: "error", title: "Could not respond", message: getFriendlyErrorMessage(error) });
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <div className="mobile-card-compact p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-brand-900 text-xl font-bold text-white">
          {sender.avatarUrl ? <img src={sender.avatarUrl} alt={`${sender.firstName} ${sender.lastName}`} className="h-full w-full object-cover" /> : `${sender.firstName[0]}${sender.lastName[0]}`}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900">
              {sender.firstName} {sender.lastName}
            </h3>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${scoreColor(0)}`}>{status}</span>
          </div>
          <p className="text-xs text-slate-500">
            {sender.faculty} • {sender.level} • {sender.university?.name}
          </p>
          {message && <p className="mt-1 text-sm text-slate-600">{message}</p>}
        </div>
      </div>

      {status === "PENDING" && (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => handleRespond(false)}
            disabled={isResponding}
            className="flex-1 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleRespond(true)}
            disabled={isResponding}
            className="flex-1 rounded-2xl bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-950 disabled:opacity-60"
          >
            {isResponding ? "Accepting..." : "Accept"}
          </button>
        </div>
      )}
    </div>
  );
}
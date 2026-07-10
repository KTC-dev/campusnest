import { useState } from "react";
import { Link } from "react-router-dom";
import { RoommateMatchCandidate, SleepSchedule, CleanlinessLevel } from "@/types";
import { roommateService } from "@/services/roommate.service";
import { useToastStore } from "@/store/toastStore";
import { getFriendlyErrorMessage } from "@/utils/error";

interface RoommateMatchCardProps {
  match: RoommateMatchCandidate;
}

function scoreColor(score: number) {
  if (score >= 80) return "bg-emerald-100 text-emerald-700";
  if (score >= 60) return "bg-brand-100 text-brand-700";
  if (score >= 40) return "bg-amber-100 text-amber-700";
  return "bg-slate-200 text-slate-600";
}

function formatBudget(min: string, max: string) {
  const minVal = Number(min);
  const maxVal = Number(max);
  return `₦${minVal.toLocaleString()}–₦${maxVal.toLocaleString()}/yr`;
}

function formatSleepSchedule(schedule: SleepSchedule) {
  return schedule.replace(/_/g, " ").toLowerCase();
}

function formatCleanliness(level: CleanlinessLevel) {
  return level.replace(/_/g, " ").toLowerCase();
}

export function RoommateMatchCard({ match }: RoommateMatchCardProps) {
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const addToast = useToastStore((s) => s.addToast);

  const { profile, score } = match;
  const student = profile.student;
  const roommateProfile = profile.roommateProfile;

  const handleSendRequest = async () => {
    if (!requestMessage.trim()) return;
    setIsSendingRequest(true);
    try {
      await roommateService.sendMatchRequest(student.id, requestMessage.trim());
      addToast({ type: "success", title: "Match request sent", message: "Your request has been sent to this student." });
      setShowRequestModal(false);
      setRequestMessage("");
    } catch (error) {
      addToast({ type: "error", title: "Could not send request", message: getFriendlyErrorMessage(error) });
    } finally {
      setIsSendingRequest(false);
    }
  };

  return (
    <div className="mobile-card-compact p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-brand-900 text-xl font-bold text-white">
          {student.avatarUrl ? <img src={student.avatarUrl} alt={`${student.firstName} ${student.lastName}`} className="h-full w-full object-cover" /> : `${student.firstName[0]}${student.lastName[0]}`}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900">
              {student.firstName} {student.lastName}
            </h3>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${scoreColor(score)}`}>{score}% match</span>
          </div>
          <p className="text-xs text-slate-500">
            {student.faculty} • {student.level} • {student.university?.name}
          </p>
        </div>
      </div>

      {roommateProfile && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-slate-600 line-clamp-2">{roommateProfile.bio || "No bio available"}</p>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {roommateProfile.budgetMin && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                {formatBudget(roommateProfile.budgetMin, roommateProfile.budgetMax)}
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              {formatSleepSchedule(roommateProfile.sleepSchedule)}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              {formatCleanliness(roommateProfile.cleanliness)}
            </span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              {roommateProfile.noiseTolerance} noise
            </span>
            {roommateProfile.isSmoker && (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">Smoker</span>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setShowRequestModal(true)}
          className="flex-1 rounded-2xl border border-brand-900 bg-white px-4 py-2 text-sm font-semibold text-brand-900 transition active:scale-95"
        >
          Send Request
        </button>
        <Link
          to={`/roommates/${student.id}`}
          className="flex-1 rounded-2xl bg-brand-900 px-4 py-2 text-sm font-semibold text-white transition active:scale-95 text-center"
        >
          View Profile
        </Link>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Send Match Request</h3>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="Say something to introduce yourself (optional)"
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              maxLength={500}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendRequest}
                disabled={isSendingRequest || !requestMessage.trim()}
                className="rounded-full bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-950 disabled:opacity-60"
              >
                {isSendingRequest ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { roommateService } from "@/services/roommate.service";
import { conversationService } from "@/services/conversation.service";
import { useToastStore } from "@/store/toastStore";
import { getFriendlyErrorMessage } from "@/utils/error";

export default function RoommateProfileViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["roommate-profile-view", id],
    queryFn: () => roommateService.getProfileById(id!),
    enabled: !!id,
  });

  async function startRoommateChat() {
    const myProfile = await roommateService.getMyProfile();
    if (!myProfile) {
      addToast({ type: "warning", title: "Create your profile first", message: "Set up your roommate profile before starting a chat." });
      navigate("/roommates/profile");
      return;
    }
    try {
      const conversation = await conversationService.create({ roommateStudentId: id! });
      navigate(`/conversations/${conversation.id}`);
    } catch (error) {
      addToast({ type: "error", title: "Could not start chat", message: getFriendlyErrorMessage(error) });
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <p className="px-6 py-10 text-sm text-slate-500 md:px-12">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <StudentMobileShell>
        <div className="page-transition">
          <p className="text-center text-sm text-slate-500 py-10">Profile not found</p>
        </div>
      </StudentMobileShell>
    );
  }

  const { student } = profile;
  const roommateProfile = student.roommateProfile;

  return (
    <StudentMobileShell>
      <div className="page-transition space-y-4">
        <section className="mobile-card-compact p-4">
          <div className="flex items-center justify-between gap-3">
            <Link to="/roommates" className="text-sm font-semibold text-brand-900">
              ? Back to matches
            </Link>
          </div>
        </section>

        <section className="mobile-card-compact p-4">
          <div className="flex items-start gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-brand-900 text-2xl font-bold text-white">
              {student.avatarUrl ? <img src={student.avatarUrl} alt={`${student.firstName} ${student.lastName}`} className="h-full w-full object-cover" /> : `${student.firstName[0]}${student.lastName[0]}`}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-sm text-slate-500">
                {student.faculty} • {student.level} • {student.university?.name}
              </p>
              {student.isVerified && (
                <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  Verified student
                </span>
              )}
            </div>
          </div>
        </section>

        {roommateProfile && (
          <section className="mobile-card-compact p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600 mb-3">Preferences</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Budget</p>
                <p className="font-medium text-slate-900">
                  ?{Number(roommateProfile.budgetMin).toLocaleString()} – ?{Number(roommateProfile.budgetMax).toLocaleString()}/yr
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Gender Preference</p>
                <p className="font-medium text-slate-900">{roommateProfile.genderPreference.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Sleep Schedule</p>
                <p className="font-medium text-slate-900">{roommateProfile.sleepSchedule.replace(/_/g, " ").toLowerCase()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Cleanliness</p>
                <p className="font-medium text-slate-900">{roommateProfile.cleanliness.replace(/_/g, " ").toLowerCase()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Noise Tolerance</p>
                <p className="font-medium text-slate-900">{roommateProfile.noiseTolerance.toLowerCase()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Smoking</p>
                <p className="font-medium text-slate-900">{roommateProfile.isSmoker ? "Smoker" : "Non-smoker"}</p>
              </div>
            </div>
          </section>
        )}

        {roommateProfile?.bio && (
          <section className="mobile-card-compact p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600 mb-3">About</h3>
            <p className="text-sm text-slate-600">{roommateProfile.bio}</p>
          </section>
        )}

        <section className="mobile-card-compact p-4">
          <button
            type="button"
            onClick={startRoommateChat}
            className="w-full rounded-2xl bg-brand-900 py-3 text-sm font-semibold text-white hover:bg-brand-950"
          >
            Start Chat
          </button>
        </section>
      </div>
    </StudentMobileShell>
  );
}

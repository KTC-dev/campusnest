import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AppNav } from "@/components/AppNav";
import { roommateService } from "@/services/roommate.service";

function scoreColor(score: number) {
  if (score >= 80) return "bg-emerald-100 text-emerald-700";
  if (score >= 60) return "bg-brand-100 text-brand-700";
  if (score >= 40) return "bg-amber-100 text-amber-700";
  return "bg-slate-200 text-slate-600";
}

export default function RoommateMatchesPage() {
  const { data: myProfile, isLoading: loadingProfile } = useQuery({
    queryKey: ["roommate-profile"],
    queryFn: roommateService.getMyProfile,
  });

  const { data: matches, isLoading: loadingMatches } = useQuery({
    queryKey: ["roommate-matches"],
    queryFn: roommateService.getMatches,
    enabled: Boolean(myProfile),
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav />

      <main className="px-6 py-8 md:px-12 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-brand-900">Roommate matches</h1>
          <Link to="/roommates/profile" className="text-sm font-medium text-brand-600 hover:underline">
            {myProfile ? "Edit your profile" : "Create your profile"}
          </Link>
        </div>

        {loadingProfile && <p className="mt-4 text-sm text-slate-500">Loading…</p>}

        {!loadingProfile && !myProfile && (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Create your roommate profile to see compatibility-ranked matches.
            <div className="mt-3">
              <Link
                to="/roommates/profile"
                className="inline-block rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Create profile
              </Link>
            </div>
          </div>
        )}

        {myProfile && loadingMatches && <p className="mt-4 text-sm text-slate-500">Finding matches…</p>}

        {myProfile && matches && matches.length === 0 && (
          <p className="mt-6 text-sm text-slate-500">
            No other active roommate profiles at your university yet. Check back soon.
          </p>
        )}

        <div className="mt-6 space-y-3">
          {matches?.map(({ profile, score }) => (
            <div key={profile.id} className="rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {profile.student.firstName} {profile.student.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {[profile.student.faculty, profile.student.level].filter(Boolean).join(" · ") || "Student"}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${scoreColor(score)}`}>{score}% match</span>
              </div>

              {profile.bio && <p className="mt-3 text-sm text-slate-600">{profile.bio}</p>}

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  ₦{Number(profile.budgetMin).toLocaleString()}–{Number(profile.budgetMax).toLocaleString()}/yr
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">{profile.sleepSchedule.replace(/_/g, " ").toLowerCase()}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">{profile.cleanliness.replace(/_/g, " ").toLowerCase()}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">{profile.isSmoker ? "Smoker" : "Non-smoker"}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">{profile.noiseTolerance.toLowerCase()} noise tolerance</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

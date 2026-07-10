import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { roommateService } from "@/services/roommate.service";
import { RoommateMatchCard } from "@/components/RoommateMatchCard";
import { RoommateMatchRequestCard } from "@/components/RoommateMatchRequestCard";

type MatchSection = "recommended" | "new" | "recent" | "saved" | "sent" | "received";

export default function RoommateMatchesPage() {
  const [activeSection, setActiveSection] = useState<MatchSection>("recommended");

  const { data: myProfile } = useQuery({
    queryKey: ["roommate-profile"],
    queryFn: roommateService.getMyProfile,
  });

  const { data: recommendedMatches, isLoading: loadingRecommended } = useQuery({
    queryKey: ["roommate-matches-recommended"],
    queryFn: () => roommateService.getMatches(),
    enabled: Boolean(myProfile),
  });

  const { data: sentRequests, isLoading: loadingSentRequests } = useQuery({
    queryKey: ["roommate-matches-sent"],
    queryFn: roommateService.getSentMatchRequests,
    enabled: Boolean(myProfile),
  });

  const { data: receivedRequests, isLoading: loadingReceivedRequests } = useQuery({
    queryKey: ["roommate-matches-received"],
    queryFn: roommateService.getReceivedMatchRequests,
    enabled: Boolean(myProfile),
  });

  const { data: savedMatches, isLoading: loadingSaved } = useQuery({
    queryKey: ["roommate-saved"],
    queryFn: roommateService.getSavedMatches,
    enabled: Boolean(myProfile),
  });

  const sentRequestIds = useMemo(() => new Set(sentRequests?.map((r) => r.receiverId) || []), [sentRequests]);
  const receivedRequestIds = useMemo(() => new Set(receivedRequests?.map((r) => r.senderId) || []), [receivedRequests]);

  const matchableCandidates = useMemo(() => {
    if (!recommendedMatches) return [];
    return recommendedMatches.filter(
      (m) => !sentRequestIds.has(m.profile.student.id) && !receivedRequestIds.has(m.profile.student.id)
    );
  }, [recommendedMatches, sentRequestIds, receivedRequestIds]);

  const newMatches = useMemo(() => {
    if (!recommendedMatches) return [];
    return recommendedMatches.filter((m) => {
      const hasSentRequest = sentRequestIds.has(m.profile.student.id);
      const hasReceivedRequest = receivedRequestIds.has(m.profile.student.id);
      return hasSentRequest || hasReceivedRequest;
    });
  }, [recommendedMatches, sentRequestIds, receivedRequestIds]);

  const activeMatches = useMemo(() => {
    if (!recommendedMatches) return [];
    return recommendedMatches.filter((m) => {
      const hasSentRequest = sentRequestIds.has(m.profile.student.id);
      const hasReceivedRequest = receivedRequestIds.has(m.profile.student.id);
      return hasSentRequest || hasReceivedRequest;
    });
  }, [recommendedMatches, sentRequestIds, receivedRequestIds]);

  if (!myProfile) {
    return (
      <StudentMobileShell>
        <div className="page-transition space-y-4">
          <section className="mobile-card-compact p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Roommates</p>
                <h1 className="mt-1 text-2xl font-display font-bold text-slate-800">Roommate matches</h1>
              </div>
            </div>
          </section>
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Create your roommate profile to find compatible matches.
            <div className="mt-3">
              <Link
                to="/roommates/profile"
                className="inline-block rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                Create profile
              </Link>
            </div>
          </div>
        </div>
      </StudentMobileShell>
    );
  }

  return (
    <StudentMobileShell>
      <div className="page-transition space-y-4">
        <section className="mobile-card-compact p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Roommates</p>
              <h1 className="mt-1 text-2xl font-display font-bold text-slate-800">Roommate matches</h1>
            </div>
            <Link to="/roommates/profile" className="text-sm font-semibold text-brand-900">
              Edit Profile
            </Link>
          </div>
        </section>

        <section className="mobile-card-compact">
          <div className="border-b border-slate-200">
            <div className="flex overflow-x-auto">
              {(["recommended", "new", "recent", "saved", "sent", "received"] as MatchSection[]).map((section) => {
                const count =
                  section === "recommended"
                    ? matchableCandidates.length
                    : section === "new"
                    ? newMatches.length
                    : section === "recent"
                    ? activeMatches.length
                    : section === "saved"
                    ? savedMatches?.length || 0
                    : section === "sent"
                    ? sentRequests?.length || 0
                    : receivedRequests?.length || 0;

                return (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`flex-1 border-b-2 px-4 py-3 text-xs font-semibold transition ${
                      activeSection === section
                        ? "border-brand-900 bg-brand-50 text-brand-900"
                        : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-4">
            {activeSection === "recommended" && (
              <>
                {loadingRecommended && <p className="text-sm text-slate-500">Finding matches...</p>}
                {matchableCandidates.length === 0 && !loadingRecommended && (
                  <p className="text-sm text-slate-500">No more recommended matches at your university.</p>
                )}
                <div className="space-y-3">
                  {matchableCandidates.map((match) => (
                    <RoommateMatchCard key={match.profile.student.id} match={match} />
                  ))}
                </div>
              </>
            )}

            {activeSection === "new" && (
              <>
                {loadingRecommended && <p className="text-sm text-slate-500">Loading...</p>}
                {newMatches.length === 0 && !loadingRecommended && (
                  <p className="text-sm text-slate-500">No new matches yet. Check back later!</p>
                )}
                <div className="space-y-3">
                  {newMatches.map((match) => (
                    <RoommateMatchCard key={match.profile.student.id} match={match} />
                  ))}
                </div>
              </>
            )}

            {activeSection === "recent" && (
              <>
                {activeMatches.length === 0 && (
                  <p className="text-sm text-slate-500">No recent matches.</p>
                )}
                <div className="space-y-3">
                  {activeMatches.map((match) => (
                    <RoommateMatchCard key={match.profile.student.id} match={match} />
                  ))}
                </div>
              </>
            )}

            {activeSection === "saved" && (
              <>
                {loadingSaved && <p className="text-sm text-slate-500">Loading...</p>}
                {savedMatches?.length === 0 && !loadingSaved && (
                  <p className="text-sm text-slate-500">No saved matches.</p>
                )}
                <div className="space-y-3">
                  {savedMatches?.map((saved) => (
                    <div key={saved.id} className="mobile-card-compact p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-brand-900 text-lg font-bold text-white">
                          {saved.target.avatarUrl ? (
                            <img src={saved.target.avatarUrl} alt={`${saved.target.firstName} ${saved.target.lastName}`} className="h-full w-full object-cover" />
                          ) : (
                            `${saved.target.firstName[0]}${saved.target.lastName[0]}`
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {saved.target.firstName} {saved.target.lastName}
                            {saved.target.isVerified && (
                              <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                Verified
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {saved.target.faculty} • {saved.target.level} • {saved.target.university?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === "sent" && (
              <>
                {loadingSentRequests && <p className="text-sm text-slate-500">Loading...</p>}
                {sentRequests?.length === 0 && !loadingSentRequests && (
                  <p className="text-sm text-slate-500">No sent requests yet.</p>
                )}
                <div className="space-y-3">
                  {sentRequests?.map((request) => (
                    <RoommateMatchRequestCard key={request.id} request={request} />
                  ))}
                </div>
              </>
            )}

            {activeSection === "received" && (
              <>
                {loadingReceivedRequests && <p className="text-sm text-slate-500">Loading...</p>}
                {receivedRequests?.length === 0 && !loadingReceivedRequests && (
                  <p className="text-sm text-slate-500">No received requests.</p>
                )}
                <div className="space-y-3">
                  {receivedRequests?.map((request) => (
                    <RoommateMatchRequestCard key={request.id} request={request} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </StudentMobileShell>
  );
}
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { roommateService } from "@/services/roommate.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PropertyCardSkeleton } from "@/components/ui/LoadingState";
import { RoommateMatchRequestCard } from "@/components/RoommateMatchRequestCard";

type MatchSection = "recommended" | "new" | "recent" | "saved" | "sent" | "received";

const sectionLabels: Record<MatchSection, string> = {
  recommended: "Recommended",
  new: "New",
  recent: "Active",
  saved: "Saved",
  sent: "Sent",
  received: "Received",
};

export default function RoommateMatchesPage() {
  const [activeSection, setActiveSection] = useState<MatchSection>("recommended");
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);

  const { data: myProfile } = useQuery({
    queryKey: ["roommate-profile"],
    queryFn: roommateService.getMyProfile,
    enabled: Boolean(user),
  });

  const { data: recommendedMatches, isLoading: loadingRecommended } = useQuery({
    queryKey: ["roommate-matches-recommended"],
    queryFn: () => roommateService.getMatches(),
    enabled: Boolean(myProfile),
  });

  const { data: sentRequests } = useQuery({
    queryKey: ["roommate-matches-sent"],
    queryFn: roommateService.getSentMatchRequests,
    enabled: Boolean(myProfile),
  });

  const { data: receivedRequests } = useQuery({
    queryKey: ["roommate-matches-received"],
    queryFn: roommateService.getReceivedMatchRequests,
    enabled: Boolean(myProfile),
  });

  const { data: savedMatches } = useQuery({
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

  const counts: Record<MatchSection, number> = {
    recommended: matchableCandidates.length,
    new: newMatches.length,
    recent: activeMatches.length,
    saved: savedMatches?.length || 0,
    sent: sentRequests?.length || 0,
    received: receivedRequests?.length || 0,
  };

  if (!myProfile) {
    return (
      <StudentMobileShell>
        <div className="page-enter space-y-5 p-4">
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Roommates</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-text.primary">Find your match</h1>
            <p className="mt-1 text-sm text-text.secondary">Create a profile to discover compatible roommates near campus.</p>
          </section>

          <Card variant="outlined" padding="lg">
            <EmptyState
              icon={
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              }
              title="No roommate profile yet"
              description="Create your profile so we can match you with compatible students based on lifestyle, budget, and preferences."
              actionLabel="Create profile"
              onAction={() => addToast({ type: "info", title: "Coming soon", message: "Profile creation is not available yet." })}
            />
          </Card>
        </div>
      </StudentMobileShell>
    );
  }

  return (
    <StudentMobileShell>
      <div className="page-enter space-y-5 pb-4">
        <section className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Roommates</p>
            <h1 className="mt-1 font-display text-2xl font-semibold text-text.primary">Matches</h1>
            <p className="mt-1 text-xs text-text.secondary">{matchableCandidates.length} potential matches</p>
          </div>
          <Link
            to="/roommates/profile"
            className="shrink-0 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold text-text.secondary transition-all duration-200 hover:border-brand-200 active:scale-95"
          >
            Edit profile
          </Link>
        </section>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(Object.keys(sectionLabels) as MatchSection[]).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${activeSection === section ? "bg-brand-900 text-white shadow-soft" : "border border-border bg-card text-text.secondary hover:border-brand-200"}`}
            >
              {sectionLabels[section]} {counts[section] ? `(${counts[section]})` : ""}
            </button>
          ))}
        </div>

        <section className="space-y-4">
          {(activeSection === "recommended" && loadingRecommended) ||
          (activeSection === "new" && loadingRecommended) ? (
            <div className="space-y-4">
              <PropertyCardSkeleton />
              <PropertyCardSkeleton />
            </div>
          ) : (
            <>
              {activeSection === "recommended" && matchableCandidates.length === 0 && (
                <Card variant="outlined" padding="lg">
                  <EmptyState
                    icon={
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    }
                    title="No more recommended matches"
                    description="Check back later or adjust your profile preferences to see more candidates."
                    actionLabel="Refresh"
                    onAction={() => addToast({ type: "info", title: "Refreshed", message: "We'll look for new matches soon." })}
                  />
                </Card>
              )}

              {activeSection === "new" && newMatches.length === 0 && (
                <Card variant="outlined" padding="lg">
                  <EmptyState
                    icon={
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    }
                    title="No new matches yet"
                    description="When someone matches with you, they'll appear here."
                    actionLabel="Browse profiles"
                    onAction={() => addToast({ type: "info", title: "Coming soon", message: "Profile browsing is not available yet." })}
                  />
                </Card>
              )}

              {activeSection === "recent" && activeMatches.length === 0 && (
                <Card variant="outlined" padding="lg">
                  <EmptyState
                    icon={
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    }
                    title="No active matches"
                    description="Start sending match requests to see them here."
                    actionLabel="View recommended"
                    onAction={() => setActiveSection("recommended")}
                  />
                </Card>
              )}

              {activeSection === "saved" && savedMatches?.length === 0 && (
                <Card variant="outlined" padding="lg">
                  <EmptyState
                    icon={
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    }
                    title="No saved matches"
                    description="Save profiles you like and they'll appear here for easy access."
                    actionLabel="View recommended"
                    onAction={() => setActiveSection("recommended")}
                  />
                </Card>
              )}

              {activeSection === "sent" && sentRequests?.length === 0 && (
                <Card variant="outlined" padding="lg">
                  <EmptyState
                    icon={
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    }
                    title="No sent requests"
                    description="When you send a match request, it will show up here."
                    actionLabel="View recommended"
                    onAction={() => setActiveSection("recommended")}
                  />
                </Card>
              )}

              {activeSection === "received" && receivedRequests?.length === 0 && (
                <Card variant="outlined" padding="lg">
                  <EmptyState
                    icon={
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    }
                    title="No received requests"
                    description="When someone sends you a match request, it will show up here."
                    actionLabel="View recommended"
                    onAction={() => setActiveSection("recommended")}
                  />
                </Card>
              )}
            </>
          )}

          {activeSection === "recommended" &&
            matchableCandidates.map((match) => (
              <RoommateMatchCard key={match.profile.student.id} match={match} onAction={(label) => addToast({ type: "info", title: label, message: "This action is not available yet." })} />
            ))}

          {activeSection === "new" &&
            newMatches.map((match) => (
              <RoommateMatchCard key={match.profile.student.id} match={match} onAction={(label) => addToast({ type: "info", title: label, message: "This action is not available yet." })} />
            ))}

          {activeSection === "recent" &&
            activeMatches.map((match) => (
              <RoommateMatchCard key={match.profile.student.id} match={match} onAction={(label) => addToast({ type: "info", title: label, message: "This action is not available yet." })} />
            ))}

          {activeSection === "saved" &&
            savedMatches?.map((saved) => (
              <Card key={saved.id} variant="elevated" padding="md" className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-brand-900 text-lg font-bold text-white">
                  {saved.target.avatarUrl ? (
                    <img src={saved.target.avatarUrl} alt={`${saved.target.firstName} ${saved.target.lastName}`} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    `${saved.target.firstName[0]}${saved.target.lastName[0]}`
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text.primary">
                    {saved.target.firstName} {saved.target.lastName}
                    {saved.target.isVerified && <Badge variant="success" size="sm" className="ml-2">Verified</Badge>}
                  </p>
                  <p className="truncate text-xs text-text.secondary">
                    {saved.target.faculty} • {saved.target.level} • {saved.target.university?.name}
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => addToast({ type: "info", title: "Coming soon", message: "Messaging is not available yet." })}>
                  Message
                </Button>
              </Card>
            ))}

          {activeSection === "sent" &&
            sentRequests?.map((request) => (
              <RoommateMatchRequestCard key={request.id} request={request} />
            ))}

          {activeSection === "received" &&
            receivedRequests?.map((request) => (
              <RoommateMatchRequestCard key={request.id} request={request} />
            ))}
        </section>
      </div>
    </StudentMobileShell>
  );
}

interface RoommateMatchCardProps {
  match: {
    profile: {
      student: {
        id: string;
        firstName: string;
        lastName: string;
        avatarUrl?: string | null;
        faculty?: string | null;
        level?: string | null;
        university?: { name: string } | null;
      };
    };
    score: number;
    breakdown?: { label: string; value: number }[];
  };
  onAction: (label: string) => void;
}

function RoommateMatchCard({ match, onAction }: RoommateMatchCardProps) {
  const profile = match.profile.student;
  const score = Math.round(match.score);

  const scoreTone = score >= 80 ? "success" : score >= 60 ? "brand" : "warning";

  return (
    <Card variant="elevated" padding="md" className="flex items-start gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[20px] bg-brand-900 text-lg font-bold text-white">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={`${profile.firstName} ${profile.lastName}`} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          `${profile.firstName[0]}${profile.lastName[0]}`
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-text.primary">
            {profile.firstName} {profile.lastName}
          </p>
          <Badge variant={scoreTone} size="sm">{score}% match</Badge>
        </div>
        <p className="mt-1 truncate text-xs text-text.secondary">
          {profile.faculty} • {profile.level} • {profile.university?.name}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {match.breakdown?.slice(0, 3).map((item) => (
            <span key={item.label} className="rounded-full border border-border bg-cream-50 px-2.5 py-1 text-[11px] font-medium text-text.secondary">
              {item.label}
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <Button variant="primary" size="sm" className="flex-1" onClick={() => onAction("Send request")}>
            Connect
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onAction("Save profile")}>
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
}

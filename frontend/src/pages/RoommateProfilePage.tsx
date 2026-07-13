import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { roommateService } from "@/services/roommate.service";
import { useAuthStore } from "@/store/authStore";
import { CleanlinessLevel, Gender, NoiseTolerance, SleepSchedule } from "@/types";

const sleepOptions: SleepSchedule[] = ["EARLY_BIRD", "NIGHT_OWL", "FLEXIBLE"];
const cleanlinessOptions: CleanlinessLevel[] = ["RELAXED", "MODERATE", "VERY_CLEAN"];
const noiseOptions: NoiseTolerance[] = ["LOW", "MEDIUM", "HIGH"];
const genderOptions: Gender[] = ["ANY", "MALE", "FEMALE"];

export default function RoommateProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: existing, isLoading } = useQuery({
    queryKey: ["roommate-profile"],
    queryFn: roommateService.getMyProfile,
    enabled: Boolean(user),
  });

  const [form, setForm] = useState({
    budgetMin: "",
    budgetMax: "",
    genderPreference: "ANY" as Gender,
    sleepSchedule: "FLEXIBLE" as SleepSchedule,
    cleanliness: "MODERATE" as CleanlinessLevel,
    isSmoker: false,
    noiseTolerance: "MEDIUM" as NoiseTolerance,
    bio: "",
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setForm({
      budgetMin: String(existing.budgetMin),
      budgetMax: String(existing.budgetMax),
      genderPreference: existing.genderPreference,
      sleepSchedule: existing.sleepSchedule,
      cleanliness: existing.cleanliness,
      isSmoker: existing.isSmoker,
      noiseTolerance: existing.noiseTolerance,
      bio: existing.bio ?? "",
      isActive: existing.isActive,
    });
  }, [existing]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await roommateService.saveProfile({
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
        genderPreference: form.genderPreference,
        sleepSchedule: form.sleepSchedule,
        cleanliness: form.cleanliness,
        isSmoker: form.isSmoker,
        noiseTolerance: form.noiseTolerance,
        bio: form.bio || undefined,
        isActive: form.isActive,
      });
      navigate("/roommates");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Couldn't save your profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <p className="px-6 py-10 text-sm text-slate-500 md:px-12">Loading…</p>
      </div>
    );
  }

  return (
    <StudentMobileShell>
      <div className="page-transition space-y-4">
        <section className="mobile-card-compact p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Roommates</p>
              <h1 className="mt-1 text-2xl font-display font-bold text-slate-800">Your roommate profile</h1>
            </div>
            <Link to="/roommates" className="text-sm font-semibold text-brand-900">
              Matches →
            </Link>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Used to find and rank compatible roommates — the more accurate, the better your matches.
          </p>
        </section>

        <form onSubmit={handleSubmit} className="mobile-card-compact space-y-4 p-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Budget range (₦/year)</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                required
                placeholder="Min"
                value={form.budgetMin}
                onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-3 py-3 text-sm"
              />
              <span className="text-slate-400">–</span>
              <input
                type="number"
                required
                placeholder="Max"
                value={form.budgetMax}
                onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))}
                className="w-full rounded-2xl border border-slate-300 px-3 py-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Preferred roommate gender</label>
            <select
              value={form.genderPreference}
              onChange={(e) => setForm((f) => ({ ...f, genderPreference: e.target.value as Gender }))}
              className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-3 text-sm"
            >
              {genderOptions.map((g) => (
                <option key={g} value={g}>
                  {g.toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Sleep schedule</label>
            <select
              value={form.sleepSchedule}
              onChange={(e) => setForm((f) => ({ ...f, sleepSchedule: e.target.value as SleepSchedule }))}
              className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-3 text-sm"
            >
              {sleepOptions.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ").toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Cleanliness</label>
            <select
              value={form.cleanliness}
              onChange={(e) => setForm((f) => ({ ...f, cleanliness: e.target.value as CleanlinessLevel }))}
              className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-3 text-sm"
            >
              {cleanlinessOptions.map((c) => (
                <option key={c} value={c}>
                  {c.replace(/_/g, " ").toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Noise tolerance</label>
            <select
              value={form.noiseTolerance}
              onChange={(e) => setForm((f) => ({ ...f, noiseTolerance: e.target.value as NoiseTolerance }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              {noiseOptions.map((n) => (
                <option key={n} value={n}>
                  {n.toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isSmoker}
              onChange={(e) => setForm((f) => ({ ...f, isSmoker: e.target.checked }))}
              className="rounded border-slate-300 accent-brand-500"
            />
            I smoke
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-700">Bio (optional)</label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              placeholder="A little about you and what you're looking for in a roommate"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="rounded border-slate-300 accent-brand-500"
            />
            Visible to other students looking for roommates
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-brand-900 py-3 text-sm font-semibold text-white hover:bg-brand-950 disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : "Save profile"}
          </button>
        </form>
      </div>
    </StudentMobileShell>
  );
}

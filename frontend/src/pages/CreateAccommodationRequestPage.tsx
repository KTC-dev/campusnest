import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { accommodationRequestService } from "@/services/accommodation-request.service";
import { useToastStore } from "@/store/toastStore";
import { RoomTypePreference, Gender } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getFriendlyErrorMessage } from "@/utils/error";
import { api } from "@/services/api";

const roomTypes: RoomTypePreference[] = ["SELF_CONTAIN", "SHARED", "ONE_BEDROOM", "TWO_BEDROOM", "HOSTEL", "ANY"];
const genders: Gender[] = ["ANY", "MALE", "FEMALE"];

export default function CreateAccommodationRequestPage() {
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  const { data: universities = [] } = useQuery<{id: string; name: string}[]>({
    queryKey: ["universities"],
    queryFn: async () => {
      const { data } = await api.get("/universities");
      return data.data;
    },
  });

  const [form, setForm] = useState({
    universityId: "",
    preferredLocation: "",
    budgetMin: "",
    budgetMax: "",
    roomType: "ANY" as RoomTypePreference,
    genderPreference: "ANY" as Gender,
    moveInDate: "",
    numberOfOccupants: "1",
    roommateRequired: false,
    preferences: "",
    additionalNotes: "",
  });

  const mutation = useMutation({
    mutationFn: accommodationRequestService.create,
    onSuccess: () => {
      addToast({ type: "success", title: "Request submitted", message: "Agents will now see your accommodation request." });
      navigate("/dashboard");
    },
    onError: (error) => addToast({ type: "error", title: "Submission failed", message: getFriendlyErrorMessage(error) }),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate({
      ...form,
      budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      numberOfOccupants: form.numberOfOccupants ? Number(form.numberOfOccupants) : undefined,
    });
  }

  return (
    <StudentMobileShell>
      <div className="page-enter space-y-5 p-4 pb-28">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600">Accommodation</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-text.primary">Find accommodation</h1>
          <p className="mt-1 text-sm text-text.secondary">Tell agents what you're looking for and they'll respond with matching properties.</p>
        </section>

        <Card variant="outlined" padding="md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">University</label>
              <select
                value={form.universityId}
                onChange={(e) => setForm((f) => ({ ...f, universityId: e.target.value }))}
                required
                className="h-12 w-full rounded-card border border-border bg-cream-50 px-4 text-sm text-text.primary outline-none transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Select university</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Preferred location/area"
              placeholder="e.g. Otuoke, Hospital Road"
              value={form.preferredLocation}
              onChange={(e) => setForm((f) => ({ ...f, preferredLocation: e.target.value }))}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Min budget (N)"
                type="number"
                placeholder="e.g. 150000"
                value={form.budgetMin}
                onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value }))}
              />
              <Input
                label="Max budget (N)"
                type="number"
                placeholder="e.g. 300000"
                value={form.budgetMax}
                onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">Room type</label>
                <select
                  value={form.roomType}
                  onChange={(e) => setForm((f) => ({ ...f, roomType: e.target.value as RoomTypePreference }))}
                  className="h-12 w-full rounded-card border border-border bg-cream-50 px-4 text-sm text-text.primary outline-none transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                >
                  {roomTypes.map((r) => (
                    <option key={r} value={r}>{r.replace(/_/g, " ").toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text-primary">Gender preference</label>
                <select
                  value={form.genderPreference}
                  onChange={(e) => setForm((f) => ({ ...f, genderPreference: e.target.value as Gender }))}
                  className="h-12 w-full rounded-card border border-border bg-cream-50 px-4 text-sm text-text.primary outline-none transition-all duration-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/20"
                >
                  {genders.map((g) => (
                    <option key={g} value={g}>{g.toLowerCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Move-in date"
                type="date"
                value={form.moveInDate}
                onChange={(e) => setForm((f) => ({ ...f, moveInDate: e.target.value }))}
              />
              <Input
                label="Number of occupants"
                type="number"
                min="1"
                value={form.numberOfOccupants}
                onChange={(e) => setForm((f) => ({ ...f, numberOfOccupants: e.target.value }))}
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.roommateRequired}
                onChange={(e) => setForm((f) => ({ ...f, roommateRequired: e.target.checked }))}
                className="accent-brand-900"
              />
              <span className="text-sm text-text.primary">I need a roommate</span>
            </label>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Preferences (optional)</label>
              <textarea
                value={form.preferences}
                onChange={(e) => setForm((f) => ({ ...f, preferences: e.target.value }))}
                rows={3}
                placeholder="e.g. Quiet area, close to faculty, furnished..."
                className="w-full rounded-2xl border bg-cream-50 px-4 py-3 text-sm text-text.primary placeholder:text-text-secondary/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border-border hover:border-primary-500/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Additional notes (optional)</label>
              <textarea
                value={form.additionalNotes}
                onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))}
                rows={3}
                placeholder="Anything else agents should know..."
                className="w-full rounded-2xl border bg-cream-50 px-4 py-3 text-sm text-text.primary placeholder:text-text-secondary/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border-border hover:border-primary-500/30"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={mutation.isPending}
              loading={mutation.isPending}
            >
              Submit request
            </Button>
          </form>
        </Card>
      </div>
    </StudentMobileShell>
  );
}

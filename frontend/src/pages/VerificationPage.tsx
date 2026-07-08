import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LandlordMobileShell } from "@/components/LandlordMobileShell";
import { Upload } from "@/components/Upload";
import { verificationService } from "@/services/verification.service";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { getFriendlyErrorMessage } from "@/utils/error";

export default function VerificationPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const { data: profile } = useQuery({ queryKey: ["profile"], queryFn: userService.getMe, enabled: Boolean(user) });
  const [docs, setDocs] = useState({ idDocument: "", selfie: "", proofOfOwnership: "" });

  useEffect(() => {
    setDocs({ idDocument: "", selfie: "", proofOfOwnership: "" });
  }, [profile?.landlord?.isVerified]);

  const mutation = useMutation({
    mutationFn: verificationService.submit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      addToast({ type: "success", title: "Verification submitted", message: "Your documents are being reviewed." });
    },
    onError: (error) => addToast({ type: "error", title: "Verification failed", message: getFriendlyErrorMessage(error) }),
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate(docs);
  }

  return (
    <LandlordMobileShell>
      <div className="page-transition space-y-4">
        <section className="mobile-card-compact p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Verification</p>
          <h1 className="mt-1 text-2xl font-display font-bold text-slate-800">Landlord verification</h1>
          <p className="mt-2 text-sm text-slate-500">Upload your documents to unlock the verified badge on your listings.</p>
        </section>

        <section className="mobile-card-compact p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Status</p>
              <h2 className="mt-1 text-lg font-display font-bold text-slate-800">
                {profile?.landlord?.isVerified ? "Verified" : "Pending review"}
              </h2>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                profile?.landlord?.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}
            >
              {profile?.landlord?.isVerified ? "Verified" : "Not verified"}
            </span>
          </div>

          {profile?.landlord?.isVerified ? (
            <p className="mt-3 text-sm text-slate-600">Your account is verified. Keep your documents updated if anything changes.</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid gap-4">
                <Upload
                  label="ID document"
                  helperText="Upload your government-issued ID"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  maxSizeMb={10}
                  onChange={(files) => {
                    const [idDocument] = files;
                    setDocs((current) => ({ ...current, idDocument: idDocument ?? "" }));
                  }}
                  onFileAdded={async (file) => {
                    const reader = new FileReader();
                    const base64 = await new Promise<string>((resolve, reject) => {
                      reader.onload = () => resolve(reader.result as string);
                      reader.onerror = reject;
                      reader.readAsDataURL(file);
                    });
                    return base64;
                  }}
                />
                <Upload
                  label="Selfie"
                  helperText="Upload a clear selfie"
                  accept="image/jpeg,image/png,image/webp"
                  maxSizeMb={10}
                  onChange={(files) => {
                    const [selfie] = files;
                    setDocs((current) => ({ ...current, selfie: selfie ?? "" }));
                  }}
                  onFileAdded={async (file) => {
                    const reader = new FileReader();
                    const base64 = await new Promise<string>((resolve, reject) => {
                      reader.onload = () => resolve(reader.result as string);
                      reader.onerror = reject;
                      reader.readAsDataURL(file);
                    });
                    return base64;
                  }}
                />
                <Upload
                  label="Proof of ownership"
                  helperText="Upload a document proving ownership"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  maxSizeMb={10}
                  onChange={(files) => {
                    const [proofOfOwnership] = files;
                    setDocs((current) => ({ ...current, proofOfOwnership: proofOfOwnership ?? "" }));
                  }}
                  onFileAdded={async (file) => {
                    const reader = new FileReader();
                    const base64 = await new Promise<string>((resolve, reject) => {
                      reader.onload = () => resolve(reader.result as string);
                      reader.onerror = reject;
                      reader.readAsDataURL(file);
                    });
                    return base64;
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={mutation.isPending || !docs.idDocument || !docs.selfie || !docs.proofOfOwnership}
                className="w-full rounded-2xl bg-brand-900 py-3 text-sm font-semibold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {mutation.isPending ? "Submitting…" : "Submit verification docs"}
              </button>
            </form>
          )}
        </section>
      </div>
    </LandlordMobileShell>
  );
}
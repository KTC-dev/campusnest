import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AgentMobileShell } from "@/components/AgentMobileShell";
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
    const { data: verification } = useQuery({
        queryKey: ["verification", "my"],
        queryFn: () => verificationService.getMyVerification(),
        enabled: Boolean(user),
    });
    const [docs, setDocs] = useState({ idDocument: "", selfie: "", proofOfOwnership: "" });

    useEffect(() => {
        setDocs({ idDocument: "", selfie: "", proofOfOwnership: "" });
    }, [profile?.agent?.isVerified]);

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
        <AgentMobileShell>
            <div className="page-transition space-y-4">
                <section className="mobile-card-compact overflow-hidden p-0">
                    <div className="bg-gradient-to-br from-brand-900 via-brand-900 to-forest-800 px-4 py-5 text-white">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cream-100/80">Verification</p>
                        <h1 className="mt-1 text-2xl font-display font-bold">Agent verification</h1>
                        <p className="mt-2 max-w-md text-sm text-cream-100/85">Upload your documents to unlock the verified badge on your listings.</p>
                    </div>
                </section>

                <section className="mobile-card-compact p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${profile?.agent?.isVerified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
                                    <path fill="currentColor" d="M12 2.25A9.75 9.75 0 1 0 21.75 12 9.76 9.76 0 0 0 12 2.25Zm4.72 7.97-5.25 5.5a.75.75 0 0 1-1.07.02l-2.85-2.85a.75.75 0 0 1 1.06-1.06l2.3 2.3 4.72-4.95a.75.75 0 0 1 1.09 1.04Z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Status</p>
                                <h2 className="mt-1 text-lg font-display font-bold text-slate-800">
                                    {profile?.agent?.isVerified ? "Verified" : verification?.status === "REJECTED" ? "Rejected" : verification?.status === "PENDING" ? "Under review" : "Not verified"}
                                </h2>
                            </div>
                        </div>
                        <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${profile?.agent?.isVerified ? "bg-emerald-100 text-emerald-700" : verification?.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                                }`}
                        >
                            {profile?.agent?.isVerified ? "Edurus Verified" : verification?.status === "REJECTED" ? "Rejected" : verification?.status === "PENDING" ? "Pending" : "Not verified"}
                        </span>
                    </div>

                    {profile?.agent?.isVerified ? (
                        <div className="mt-3 space-y-2">
                            <p className="text-sm text-slate-600">Your agent account is verified. The verified badge is now visible on your listings and profile.</p>
                            <p className="text-[10px] text-text.secondary">Verified on {verification?.reviewedAt ? new Date(verification.reviewedAt).toLocaleDateString() : "recently"}</p>
                        </div>
                    ) : verification?.status === "REJECTED" ? (
                        <div className="mt-3 space-y-2">
                            <p className="text-sm text-red-600">Your verification was rejected.</p>
                            {verification.adminNotes && <p className="text-xs text-slate-600">Reason: {verification.adminNotes}</p>}
                            <p className="text-xs text-slate-600">Please update your documents and resubmit.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                            <div className="rounded-2xl bg-slate-50 p-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Documents</p>
                                <p className="mt-1 text-sm text-slate-600">Provide all three files before submitting.</p>
                            </div>

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
                                {mutation.isPending ? "Submitting…" : "Submit for verification"}
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </AgentMobileShell>
    );
}

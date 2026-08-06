import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LandlordMobileShell } from "@/components/LandlordMobileShell";
import { StudentMobileShell } from "@/components/StudentMobileShell";
import { Upload } from "@/components/Upload";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { verificationService } from "@/services/verification.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { University, UserProfile } from "@/types";
import { getFriendlyErrorMessage } from "@/utils/error";
import { Badge } from "@/components/ui/Badge";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";

interface ProfileFormState {
    firstName: string;
    lastName: string;
    phone: string;
    faculty: string;
    level: string;
    avatarUrl: string;
    businessName: string;
    universityId: string;
}

function getInitialFormState(profile?: UserProfile): ProfileFormState {
    const student = profile?.student;
    const landlord = profile?.landlord;
    const admin = profile?.admin;

    if (profile?.role === "STUDENT") {
        return {
            firstName: student?.firstName ?? "",
            lastName: student?.lastName ?? "",
            phone: student?.phone ?? "",
            faculty: student?.faculty ?? "",
            level: student?.level ?? "",
            avatarUrl: student?.avatarUrl ?? "",
            businessName: "",
            universityId: student?.universityId ?? "",
        };
    }

    if (profile?.role === "LANDLORD") {
        return {
            firstName: landlord?.firstName ?? "",
            lastName: landlord?.lastName ?? "",
            phone: landlord?.phone ?? "",
            faculty: "",
            level: "",
            avatarUrl: landlord?.avatarUrl ?? "",
            businessName: landlord?.businessName ?? "",
            universityId: "",
        };
    }

    return {
        firstName: admin?.firstName ?? "",
        lastName: admin?.lastName ?? "",
        phone: "",
        faculty: "",
        level: "",
        avatarUrl: admin?.avatarUrl ?? "",
        businessName: "",
        universityId: "",
    };
}

export default function ProfilePage() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const accessToken = useAuthStore((state) => state.accessToken);
    const addToast = useToastStore((state) => state.addToast);

    const { data: profile, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: userService.getMe,
        enabled: Boolean(user && accessToken),
        retry: false,
    });

    const { data: universities = [] } = useQuery({
        queryKey: ["universities"],
        queryFn: authService.listUniversities,
    });

    const [form, setForm] = useState<ProfileFormState>(getInitialFormState(profile));
    const [verificationDocs, setVerificationDocs] = useState({
        idDocument: "",
        selfie: "",
        proofOfOwnership: "",
    });
    const avatarInputRef = useRef<HTMLInputElement | null>(null);
    const [isPersonalInfoExpanded, setIsPersonalInfoExpanded] = useState(false);

    const displayName = useMemo(() => {
        const firstName = profile?.student?.firstName || profile?.landlord?.firstName || profile?.admin?.firstName || "";
        const lastName = profile?.student?.lastName || profile?.landlord?.lastName || profile?.admin?.lastName || "";
        return `${firstName} ${lastName}`.trim() || user?.email.split("@")[0] || "Edurus";
    }, [profile, user?.email]);

    const initials = useMemo(() => {
        const parts = displayName.split(" ").filter(Boolean);
        if (parts.length === 0) return "N";
        const first = parts[0];
        const lastPart = parts.length > 1 ? parts[parts.length - 1] : first;
        const lastLetter = lastPart.length > 1 ? lastPart[lastPart.length - 1] : "N";
        return first[0].toUpperCase() + lastLetter.toUpperCase();
    }, [displayName]);

    useEffect(() => {
        setForm(getInitialFormState(profile));
    }, [profile]);

    const mutation = useMutation({
        mutationFn: userService.update,
        onSuccess: (updatedProfile) => {
            queryClient.setQueryData(["profile"], updatedProfile);
            addToast({ type: "success", title: "Profile updated", message: "Your changes have been saved." });
        },
        onError: (error) => {
            addToast({ type: "error", title: "Profile update failed", message: getFriendlyErrorMessage(error) });
        },
    });

    const verificationMutation = useMutation({
        mutationFn: verificationService.submit,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            addToast({ type: "success", title: "Verification submitted", message: "Your documents are being reviewed." });
        },
        onError: (error) => {
            addToast({ type: "error", title: "Verification failed", message: getFriendlyErrorMessage(error) });
        },
    });

    function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const payload = {
            firstName: form.firstName || undefined,
            lastName: form.lastName || undefined,
            phone: form.phone || null,
            faculty: form.faculty || null,
            level: form.level || null,
            avatarUrl: form.avatarUrl || null,
            businessName: form.businessName || null,
            universityId: form.universityId || undefined,
        };

        mutation.mutate(payload);
    }

    const isLandlord = profile?.role === "LANDLORD";
    const landlordVerificationStatus = profile?.landlord?.isVerified ? "VERIFIED" : "PENDING";
    const Shell = user?.role === "LANDLORD" ? LandlordMobileShell : StudentMobileShell;

    if (isLoading) {
        return (
            <Shell>
                <div className="page-enter space-y-4 p-4">
                    <div className="flex flex-col items-center gap-4">
                        <Skeleton variant="circle" height={96} width={96} />
                        <Skeleton variant="text" className="h-5 w-32" />
                    </div>
                    <Card variant="outlined" padding="md">
                        <div className="space-y-4">
                            <Skeleton variant="text" className="h-4 w-24" />
                            <Skeleton variant="rectangle" className="h-12 w-full rounded-2xl" />
                            <Skeleton variant="rectangle" className="h-12 w-full rounded-2xl" />
                        </div>
                    </Card>
                </div>
            </Shell>
        );
    }

    return (
        <Shell>
            <div className="page-enter space-y-5 pb-28">
                <div className="flex flex-col items-center text-center">
                    <div className="relative">
                        <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-primary-500 p-0.5 shadow-premium sm:h-32 sm:w-32">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 opacity-10" />
                            {form.avatarUrl ? (
                                <img src={form.avatarUrl} alt={`${displayName} profile picture`} className="relative h-full w-full rounded-full object-cover" />
                            ) : (
                                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-2xl font-semibold text-white">
                                    {initials}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => avatarInputRef.current?.click()}
                            aria-label="Change profile picture"
                            className="absolute -bottom-1 -right-1 flex h-11 w-11 items-center justify-center rounded-full bg-primary-700 text-white shadow-brand transition-transform duration-200 hover:bg-primary-800 hover:shadow-brand-lg active:scale-95"
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                                <path fill="currentColor" d="M12 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm7.5-.75h-1.88l-.76-1.52A2.25 2.25 0 0 0 15.84 3.5H8.16c-.86 0-1.65.49-2.03 1.23l-.76 1.52H3.5A2.25 2.25 0 0 0 1.25 8.5v8A2.25 2.25 0 0 0 3.5 18.75h17A2.25 2.25 0 0 0 22.75 16.5v-8A2.25 2.25 0 0 0 19.5 6.25Zm1.25 10.25a.75.75 0 0 1-.75.75h-17a.75.75 0 0 1-.75-.75v-8A.75.75 0 0 1 3.5 7.75h2.2a.75.75 0 0 0 .67-.42l.97-1.94c.13-.27.4-.44.7-.44h7.72c.3 0 .57.17.7.44l.97 1.94c.13.25.38.42.67.42h2.2a.75.75 0 0 1 .75.75v8Z" />
                            </svg>
                        </button>
                        <input
                            ref={avatarInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                    const avatarUrl = reader.result as string;
                                    setForm((current) => ({ ...current, avatarUrl }));
                                    mutation.mutate({ avatarUrl });
                                };
                                reader.readAsDataURL(file);
                            }}
                        />
                    </div>
                    <h1 className="mt-4 font-display text-xl font-semibold text-text.primary">{displayName}</h1>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                        <Badge size="sm" className="bg-primary-700/10 text-primary-700 px-2.5 py-1 rounded-full text-xs font-semibold">{profile?.role?.toLowerCase()}</Badge>
                        {profile?.landlord?.isVerified && <VerifiedBadge size={20} />}
                    </div>
                </div>

                <Card variant="strong" padding="md" className="border border-border/60">
                    <button
                        type="button"
                        onClick={() => setIsPersonalInfoExpanded((prev) => !prev)}
                        className="flex w-full items-center justify-between gap-3"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Personal information</p>
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`text-text.secondary transition-transform duration-200 ${isPersonalInfoExpanded ? "rotate-180" : ""}`}
                        >
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>
                    {isPersonalInfoExpanded && (
                        <>
                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <Input label="First name" name="firstName" value={form.firstName} onChange={handleChange} className="col-span-1" />
                                <Input label="Last name" name="lastName" value={form.lastName} onChange={handleChange} className="col-span-1" />
                            </div>
                            <div className="mt-3">
                                <Input label="Phone number" name="phone" value={form.phone} onChange={handleChange} />
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <Input label="Faculty" name="faculty" value={form.faculty} onChange={handleChange} className="col-span-1" />
                                <Input label="Level" name="level" value={form.level} onChange={handleChange} className="col-span-1" />
                            </div>
                            <div className="mt-3">
                                <label className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">University</label>
                                <select
                                    name="universityId"
                                    value={form.universityId}
                                    onChange={handleChange}
                                    className="mt-1.5 h-12 w-full rounded-2xl border border-border bg-cream-50 px-4 text-sm text-text.primary outline-none transition-all duration-200 focus:border-primary-400 focus:shadow-brand focus:ring-2 focus:ring-primary-500/20"
                                >
                                    <option value="">Select a university</option>
                                    {universities.map((university: University) => (
                                        <option key={university.id} value={university.id}>
                                            {university.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {isLandlord && (
                                <div className="mt-3">
                                    <Input label="Business name" name="businessName" value={form.businessName} onChange={handleChange} />
                                </div>
                            )}
                        </>
                    )}
                </Card>

                {isLandlord && (
                    <Card variant="strong" padding="md" className="border border-border/60">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Verification status</p>
                                <p className="mt-1 text-sm text-text.primary">
                                    {profile?.landlord?.isVerified ? "Your landlord account is verified." : "Submit your documents to unlock the verified landlord badge."}
                                </p>
                            </div>
                            <Badge variant={profile?.landlord?.isVerified ? "success" : "warning"} size="sm">{landlordVerificationStatus}</Badge>
                        </div>
                        {!profile?.landlord?.isVerified && (
                            <div className="mt-4 space-y-3">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <Upload
                                        label="ID document"
                                        helperText="Government-issued ID"
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        maxSizeMb={10}
                                        onChange={(files) => {
                                            const [idDocument] = files;
                                            setVerificationDocs((current) => ({ ...current, idDocument: idDocument ?? "" }));
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
                                        helperText="Clear selfie"
                                        accept="image/jpeg,image/png,image/webp"
                                        maxSizeMb={10}
                                        onChange={(files) => {
                                            const [selfie] = files;
                                            setVerificationDocs((current) => ({ ...current, selfie: selfie ?? "" }));
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
                                        helperText="Ownership document"
                                        accept="image/jpeg,image/png,image/webp,application/pdf"
                                        maxSizeMb={10}
                                        onChange={(files) => {
                                            const [proofOfOwnership] = files;
                                            setVerificationDocs((current) => ({ ...current, proofOfOwnership: proofOfOwnership ?? "" }));
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
                                <Button
                                    variant="secondary"
                                    size="md"
                                    fullWidth
                                    disabled={verificationMutation.isPending || !verificationDocs.idDocument || !verificationDocs.selfie || !verificationDocs.proofOfOwnership}
                                    loading={verificationMutation.isPending}
                                    onClick={() => verificationMutation.mutate(verificationDocs)}
                                >
                                    Submit verification docs
                                </Button>
                            </div>
                        )}
                    </Card>
                )}

                <Card variant="strong" padding="md" className="border border-border/60">
                    <button
                        onClick={() => navigate("/help")}
                        className="flex w-full items-center justify-between gap-3"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Help</p>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                </Card>

                <Card variant="strong" padding="md" className="border border-border/60">
                    <div className="flex w-full items-center justify-between gap-3">
                        <button type="button" onClick={() => navigate("/about")} className="flex items-center gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">About</p>
                            </div>
                        </button>
                        <button type="button" onClick={() => navigate("/settings")} className="flex items-center gap-2 rounded-full bg-cream-50 px-3 py-2 text-xs font-semibold text-text.primary hover:shadow-sm">
                            Settings
                        </button>
                    </div>
                </Card>

                <Card variant="strong" padding="md" className="border border-border/60 opacity-60">
                    <div className="flex w-full items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Security</p>
                        <span className="text-xs text-text.secondary">Coming soon</span>
                    </div>
                </Card>

                <Card variant="strong" padding="md" className="border border-border/60 opacity-60">
                    <div className="flex w-full items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Notifications</p>
                        <span className="text-xs text-text.secondary">Coming soon</span>
                    </div>
                </Card>

                <Card variant="strong" padding="md" className="border border-border/60 opacity-60">
                    <div className="flex w-full items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Settings</p>
                        <span className="text-xs text-text.secondary">Coming soon</span>
                    </div>
                </Card>
                <button
                    type="button"
                    onClick={() => {
                        logout();
                        navigate("/");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-error/40 bg-error/8 py-3.5 text-sm font-semibold text-error transition-all duration-200 hover:bg-error/10 active:scale-[0.98]"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Log out
                </button>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-white/90 px-4 py-3 backdrop-blur-xl">
                <div className="mx-auto max-w-md">
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        type="submit"
                        disabled={mutation.isPending}
                        loading={mutation.isPending}
                        onClick={handleSubmit as any}
                        className="rounded-full shadow-brand hover:shadow-brand-lg"
                    >
                        {mutation.isPending ? "Saving…" : "Save profile"}
                    </Button>
                    <div className="h-[env(safe-area-inset-bottom)]" />
                </div>
            </div>
        </Shell>
    );
}

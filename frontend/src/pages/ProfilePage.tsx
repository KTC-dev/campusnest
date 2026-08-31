import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AgentMobileShell } from "@/components/AgentMobileShell";
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
    const agent = profile?.agent;
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

    if (profile?.role === "AGENT") {
        return {
            firstName: agent?.firstName ?? "",
            lastName: agent?.lastName ?? "",
            phone: agent?.phone ?? "",
            faculty: "",
            level: "",
            avatarUrl: agent?.avatarUrl ?? "",
            businessName: agent?.businessName ?? "",
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
        const firstName = profile?.student?.firstName || profile?.agent?.firstName || profile?.admin?.firstName || "";
        const lastName = profile?.student?.lastName || profile?.agent?.lastName || profile?.admin?.lastName || "";
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

    const isAgent = profile?.role === "AGENT";
    const Shell = user?.role === "AGENT" ? AgentMobileShell : StudentMobileShell;

    if (isLoading) {
        return (
            <Shell>
                <div className="page-enter space-y-3 p-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-3">
                        <Skeleton variant="circle" height={40} width={40} />
                        <div className="flex-1 space-y-2">
                            <Skeleton variant="text" className="h-4 w-32" />
                            <Skeleton variant="text" className="h-3 w-20" />
                        </div>
                    </div>
                    <Card variant="outlined" padding="md">
                        <div className="space-y-3">
                            <Skeleton variant="text" className="h-4 w-24" />
                            <Skeleton variant="rectangle" className="h-11 w-full rounded-2xl" />
                            <Skeleton variant="rectangle" className="h-11 w-full rounded-2xl" />
                        </div>
                    </Card>
                </div>
            </Shell>
        );
    }

    return (
        <Shell>
            <div className="page-enter space-y-3 pb-28">
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-3">
                    <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-full">
                        {form.avatarUrl ? (
                            <img src={form.avatarUrl} alt={`${displayName} profile picture`} className="h-full w-full rounded-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-sm font-semibold text-white">
                                {initials}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-sm font-semibold text-text.primary">{displayName}</p>
                        <div className="mt-0.5 flex items-center gap-1.5">
                            <Badge size="sm" className="bg-primary-700/10 text-primary-700 px-2 py-0.5 rounded-full text-[11px] font-semibold">{profile?.role?.toLowerCase()}</Badge>
                            {profile?.agent?.isVerified && <VerifiedBadge size={16} showText />}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        aria-label="Edit profile picture"
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-text.secondary transition-colors duration-200 hover:bg-border/60 hover:text-text.primary"
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                            <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                    </button>
                    <input
                        ref={avatarInputRef}
                        type="file"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                                const avatarUrl = reader.result as string;
                                setForm((current) => ({ ...current, avatarUrl }));
                                mutation.mutate({ avatarUrl });
                            };
                            reader.readAsDataURL(file);
                        }}
                        className="hidden"
                    />
                </div>

                <div className="space-y-2">
                    <Card variant="strong" padding="sm" className="p-0 overflow-hidden border border-border/60">
                        <button
                            type="button"
                            onClick={() => setIsPersonalInfoExpanded((prev) => !prev)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left"
                        >
                            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-700/10 text-primary-700">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </span>
                            <span className="flex-1 text-sm font-semibold text-text.primary">Personal Information</span>
                            <svg
                                width="18"
                                height="18"
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
                            <div className="space-y-3 border-t border-border/60 px-4 py-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <Input label="First name" name="firstName" value={form.firstName} onChange={handleChange} className="col-span-1" />
                                    <Input label="Last name" name="lastName" value={form.lastName} onChange={handleChange} className="col-span-1" />
                                </div>
                                <div className="mt-0">
                                    <Input label="Phone number" name="phone" value={form.phone} onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <Input label="Faculty" name="faculty" value={form.faculty} onChange={handleChange} className="col-span-1" />
                                    <Input label="Level" name="level" value={form.level} onChange={handleChange} className="col-span-1" />
                                </div>
                                <div>
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
                                {isAgent && (
                                    <div>
                                        <Input label="Business name" name="businessName" value={form.businessName} onChange={handleChange} />
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    <NavItem icon="help" label="Help" onClick={() => navigate("/help")} />
                    <NavItem icon="info" label="About" onClick={() => navigate("/about")} />
                    <NavItem icon="shield" label="Security" onClick={() => navigate("/settings")} />
                    <NavItem icon="bell" label="Notifications" onClick={() => navigate("/notifications")} />
                    <NavItem icon="settings" label="Settings" onClick={() => navigate("/settings")} />
                </div>

                {isAgent && (
                    <Card variant="strong" padding="sm" className="p-0 overflow-hidden border border-border/60">
                        <div className="px-4 py-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text.secondary">Verification</p>
                                    <p className="mt-1 text-sm text-text.primary">
                                        {profile?.agent?.isVerified ? "Verified. The badge is visible on your profile." : "Submit your ID, selfie, and proof of ownership to unlock the verified badge."}
                                    </p>
                                </div>
                                {profile?.agent?.isVerified && <VerifiedBadge size={20} showText />}
                            </div>
                            {!profile?.agent?.isVerified && (
                                <div className="mt-3 space-y-3">
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
                                        Submit agent verification docs
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                <button
                    type="button"
                    onClick={() => {
                        logout();
                        navigate("/");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border/60 bg-white px-4 py-3 text-sm font-medium text-text.secondary transition-all duration-200 hover:border-border hover:text-text.primary active:scale-[0.98]"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
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

function NavItem({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
    const iconPaths: Record<string, React.ReactNode> = {
        help: (
            <circle cx="12" cy="12" r="10" />
        ),
        info: (
            <circle cx="12" cy="12" r="10" />
        ),
        shield: (
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        ),
        bell: (
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        ),
        settings: (
            <circle cx="12" cy="12" r="3" />
        ),
    };

    const iconExtra: Record<string, React.ReactNode> = {
        help: (
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
        ),
        info: (
            <>
                <line x1="12" y1="16" x2="12" y2="12" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="8" x2="12.01" y2="8" strokeLinecap="round" strokeLinejoin="round" />
            </>
        ),
        settings: (
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        ),
    };

    return (
        <Card variant="strong" padding="sm" className="p-0 overflow-hidden border border-border/60">
            <button onClick={onClick} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-border/60 text-text.secondary">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {iconPaths[icon]}
                        {iconExtra[icon]}
                    </svg>
                </span>
                <span className="flex-1 text-sm font-semibold text-text.primary">{label}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text.secondary">
                    <polyline points="9 18 15 12 9 6" />
                </svg>
            </button>
        </Card>
    );
}



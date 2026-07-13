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

    const displayName = useMemo(() => {
        const firstName = profile?.student?.firstName || profile?.landlord?.firstName || profile?.admin?.firstName || "";
        const lastName = profile?.student?.lastName || profile?.landlord?.lastName || profile?.admin?.lastName || "";
        return `${firstName} ${lastName}`.trim() || user?.email.split("@")[0] || "Edurus";
    }, [profile, user?.email]);

    const initials = useMemo(() => {
        const parts = displayName.split(" ").filter(Boolean);
        return (parts[0]?.[0] ?? "C") + (parts[1]?.[0] ?? "N");
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

    const isStudent = profile?.role === "STUDENT";
    const isLandlord = profile?.role === "LANDLORD";
    const landlordVerificationStatus = profile?.landlord?.isVerified ? "VERIFIED" : "PENDING";
    const Shell = user?.role === "LANDLORD" ? LandlordMobileShell : StudentMobileShell;

    return (
        <Shell>
            <main className="page-transition space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Your profile</p>
                            <h1 className="mt-2 text-2xl font-bold text-brand-900">Keep your account details up to date</h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Update the information that appears on your account and in your listings.
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                                {profile?.role?.toLowerCase()}
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    logout();
                                    navigate("/");
                                }}
                                className="rounded-full border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:border-brand-400 hover:text-brand-900"
                            >
                                Log out
                            </button>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col items-center gap-2.5 text-center md:mt-6 md:items-start md:text-left">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => avatarInputRef.current?.click()}
                                aria-label="Change profile picture"
                                className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-brand-900/15 bg-brand-900/10 text-xl font-bold text-brand-900 shadow-sm transition-all duration-200 hover:border-brand-900/30 hover:brightness-[0.98] active:scale-95 sm:h-28 sm:w-28 sm:text-2xl"
                            >
                                {form.avatarUrl ? (
                                    <img src={form.avatarUrl} alt={`${displayName} profile picture`} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-900/15 via-cream-100 to-gold-400/20 text-brand-900">
                                        {initials}
                                    </span>
                                )}
                                <span className="absolute inset-0 bg-slate-900/0 transition-colors duration-200 group-hover:bg-slate-900/20 group-active:bg-slate-900/20" />
                                <span className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-900 text-white shadow-sm transition-transform duration-200 group-hover:scale-105 sm:bottom-2 sm:right-2 sm:h-9 sm:w-9">
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
                                        <path fill="currentColor" d="M12 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 1.5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm7.5-.75h-1.88l-.76-1.52A2.25 2.25 0 0 0 15.84 3.5H8.16c-.86 0-1.65.49-2.03 1.23l-.76 1.52H3.5A2.25 2.25 0 0 0 1.25 8.5v8A2.25 2.25 0 0 0 3.5 18.75h17A2.25 2.25 0 0 0 22.75 16.5v-8A2.25 2.25 0 0 0 19.5 6.25Zm1.25 10.25a.75.75 0 0 1-.75.75h-17a.75.75 0 0 1-.75-.75v-8A.75.75 0 0 1 3.5 7.75h2.2a.75.75 0 0 0 .67-.42l.97-1.94c.13-.27.4-.44.7-.44h7.72c.3 0 .57.17.7.44l.97 1.94c.13.25.38.42.67.42h2.2a.75.75 0 0 1 .75.75v8Z" />
                                    </svg>
                                </span>
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
                        <div className="max-w-sm">
                            <p className="text-sm font-semibold text-slate-800 sm:text-base">{displayName}</p>
                            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Tap the camera badge to change your profile picture.</p>
                        </div>
                    </div>

                    {isLandlord && (
                        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-semibold">Verification status</p>
                                    <p className="mt-1 text-amber-700">
                                        {profile?.landlord?.isVerified ? "Your landlord account is verified." : "Submit your documents to unlock the verified landlord badge."}
                                    </p>
                                </div>
                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                                    {landlordVerificationStatus}
                                </span>
                            </div>
                            {!profile?.landlord?.isVerified && (
                                <div className="mt-4 space-y-3">
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <Upload
                                            label="ID document"
                                            helperText="Upload your government-issued ID"
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
                                            helperText="Upload a clear selfie"
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
                                            helperText="Upload a document proving ownership"
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
                                    <button
                                        type="button"
                                        disabled={verificationMutation.isPending || !verificationDocs.idDocument || !verificationDocs.selfie || !verificationDocs.proofOfOwnership}
                                        onClick={() => verificationMutation.mutate(verificationDocs)}
                                        className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {verificationMutation.isPending ? "Submitting…" : "Submit verification docs"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {isLoading ? (
                        <p className="mt-6 text-sm text-slate-500">Loading your profile…</p>
                    ) : (
                        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                            <div className="grid gap-4 md:grid-cols-2">
                                <label className="text-sm font-medium text-slate-700">
                                    First name
                                    <input
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-0"
                                    />
                                </label>
                                <label className="text-sm font-medium text-slate-700">
                                    Last name
                                    <input
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-0"
                                    />
                                </label>
                            </div>

                            <label className="block text-sm font-medium text-slate-700">
                                Phone number
                                <input
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-0"
                                />
                            </label>

                            {isStudent && (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label className="text-sm font-medium text-slate-700">
                                            Faculty
                                            <input
                                                name="faculty"
                                                value={form.faculty}
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-0"
                                            />
                                        </label>
                                        <label className="text-sm font-medium text-slate-700">
                                            Level
                                            <input
                                                name="level"
                                                value={form.level}
                                                onChange={handleChange}
                                                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-0"
                                            />
                                        </label>
                                    </div>

                                    <label className="block text-sm font-medium text-slate-700">
                                        University
                                        <select
                                            name="universityId"
                                            value={form.universityId}
                                            onChange={handleChange}
                                            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-0"
                                        >
                                            <option value="">Select a university</option>
                                            {universities.map((university: University) => (
                                                <option key={university.id} value={university.id}>
                                                    {university.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </>
                            )}

                            {isLandlord && (
                                <label className="block text-sm font-medium text-slate-700">
                                    Business name
                                    <input
                                        name="businessName"
                                        value={form.businessName}
                                        onChange={handleChange}
                                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none ring-0"
                                    />
                                </label>
                            )}

                            <div className="space-y-3">
                                <Upload
                                    label="Profile picture"
                                    helperText="Upload or browse for your profile photo"
                                    accept="image/jpeg,image/png,image/webp"
                                    maxSizeMb={5}
                                    onChange={(files) => {
                                        const [avatarUrl] = files;
                                        setForm((current) => ({ ...current, avatarUrl: avatarUrl ?? "" }));
                                        if (avatarUrl) {
                                            mutation.mutate({ avatarUrl });
                                        }
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
                                {form.avatarUrl ? (
                                    <div className="rounded-[18px] bg-emerald-50 px-4 py-3 text-emerald-800">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
                                                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                                                    <path fill="currentColor" d="M12 2.25A9.75 9.75 0 1 0 21.75 12 9.76 9.76 0 0 0 12 2.25Zm4.72 7.97-5.25 5.5a.75.75 0 0 1-1.07.02l-2.85-2.85a.75.75 0 0 1 1.06-1.06l2.3 2.3 4.72-4.95a.75.75 0 0 1 1.09 1.04Z" />
                                                </svg>
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-emerald-900">Photo ready</p>
                                                <p className="text-xs text-emerald-700">Changes save automatically after upload.</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                <p className="text-sm text-slate-500">
                                    {mutation.isPending ? "Saving changes…" : "Your updates will be available instantly."}
                                </p>
                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {mutation.isPending ? "Saving..." : "Save profile"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </Shell>
    );
}

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppNav } from "@/components/AppNav";
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
    const user = useAuthStore((state) => state.user);
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

    return (
        <div className="min-h-screen bg-slate-50">
            <AppNav />

            <main className="mx-auto max-w-3xl px-6 py-8 md:px-12">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Your profile</p>
                            <h1 className="mt-2 text-2xl font-bold text-brand-900">Keep your account details up to date</h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Update the information that appears on your account and in your listings.
                            </p>
                        </div>
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
                            {profile?.role?.toLowerCase()}
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

                            <div>
                                <p className="text-sm font-medium text-slate-700">Profile picture</p>
                                <Upload
                                    label="Profile picture"
                                    helperText="Drag & drop your profile photo"
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
                                    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                        <img src={form.avatarUrl} alt="Profile preview" className="h-14 w-14 rounded-full object-cover" />
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">Photo ready</p>
                                            <p className="text-xs text-slate-500">Changes save automatically after upload.</p>
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
        </div>
    );
}

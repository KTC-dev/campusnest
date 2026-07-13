import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { University } from "@/types";
import { getFriendlyErrorMessage } from "@/utils/error";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setTokens = useAuthStore((s) => s.setTokens);
  const addToast = useToastStore((s) => s.addToast);

  const [role, setRole] = useState<"student" | "landlord">(
    searchParams.get("role") === "landlord" ? "landlord" : "student"
  );
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    universityId: "",
  });
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoadingUniversities, setIsLoadingUniversities] = useState(false);
  const [universitiesError, setUniversitiesError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const termsVersion = "1.0";

  useEffect(() => {
    if (role !== "student") return;

    let ignore = false;

    async function loadUniversities() {
      setIsLoadingUniversities(true);
      setUniversitiesError(null);

      try {
        const data = await authService.listUniversities();
        if (!ignore) {
          setUniversities(data);
          setForm((f) => ({ ...f, universityId: f.universityId || data[0]?.id || "" }));
        }
      } catch {
        if (!ignore) {
          setUniversitiesError("Unable to load universities right now.");
        }
      } finally {
        if (!ignore) {
          setIsLoadingUniversities(false);
        }
      }
    }

    loadUniversities();

    return () => {
      ignore = true;
    };
  }, [role]);

  function update(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const tokens =
        role === "student"
          ? await authService.registerStudent({
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName,
            universityId: form.universityId,
            phone: form.phone || undefined,
            acceptedTerms: acceptedLegal,
            acceptedTermsVersion: termsVersion,
            acceptedTermsAt: new Date().toISOString(),
          })
          : await authService.registerLandlord({
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName,
            phone: form.phone,
            acceptedTerms: acceptedLegal,
            acceptedTermsVersion: termsVersion,
            acceptedTermsAt: new Date().toISOString(),
          });
      setTokens(tokens);
      addToast({ type: "success", title: "Account created", message: "Your Edurus account is ready." });
      navigate("/dashboard");
    } catch (err: any) {
      const message = getFriendlyErrorMessage(err);
      setError(message);
      addToast({ type: "error", title: "Registration failed", message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-slate-50 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <h1 className="text-2xl font-bold text-brand-900">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500">Join Edurus with consent, verification, and clear policies built in.</p>

        <div className="mt-4 flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
          {(["student", "landlord"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`flex-1 rounded-md py-1.5 capitalize transition-colors ${role === r ? "bg-white shadow-sm text-brand-600" : "text-slate-500"}`}
            >
              {r}
            </button>
          ))}
        </div>

        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder="First name"
              required
              value={form.firstName}
              onChange={update("firstName")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <input
              placeholder="Last name"
              required
              value={form.lastName}
              onChange={update("lastName")}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={update("email")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <input
            type="tel"
            placeholder="Phone number"
            required={role === "landlord"}
            value={form.phone}
            onChange={update("phone")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />

          {role === "student" && (
            <div className="space-y-1">
              <select
                required
                value={form.universityId}
                onChange={(e) => setForm((f) => ({ ...f, universityId: e.target.value }))}
                disabled={isLoadingUniversities}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">{isLoadingUniversities ? "Loading universities..." : "Select university"}</option>
                {universities.map((university) => (
                  <option key={university.id} value={university.id}>
                    {university.name}
                  </option>
                ))}
              </select>
              {universitiesError && <p className="text-xs text-red-600">{universitiesError}</p>}
            </div>
          )}

          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={update("password")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            <label className="flex items-start gap-2">
              <input id="accept-legal" type="checkbox" checked={acceptedLegal} onChange={(e) => setAcceptedLegal(e.target.checked)} className="mt-1" />
              <span>
                I have read and agree to the <a href="/terms" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Privacy Policy</a>. I understand Edurus will use my data to create and manage my account.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !acceptedLegal}
            className="w-full rounded-lg bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
          >
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

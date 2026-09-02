"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Wallet } from "lucide-react";
import { authApi, ApiError } from "@/lib/api";
import { useLanguage } from "@/lib/language-context";

type Step = "email" | "reset" | "done";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(t("auth.forgot.emailError"));
      return;
    }
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setStep("reset");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReset(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authApi.resetPassword(email, code, newPassword);
      setStep("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("common.genericError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6faf7] px-4 py-14">
      <div className="app-container">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-card">
            {step === "done" ? <KeyRound size={26} strokeWidth={2.2} /> : <Wallet size={26} strokeWidth={2.2} />}
          </span>
          <h1 className="mt-4 text-2xl font-bold text-brand-950">{t("auth.forgot.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {step === "email" && t("auth.forgot.subtitle")}
            {step === "reset" && t("auth.forgot.codeSentDesc", { email })}
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={handleSendCode} className="card flex flex-col gap-4">
            <Field label={t("auth.forgot.email")}>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
              />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting} className="btn-primary mt-1">
              {submitting ? t("auth.forgot.sending") : t("auth.forgot.sendCode")}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleReset} className="card flex flex-col gap-4">
            <Field label={t("auth.forgot.code")}>
              <input
                required
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="input text-center tracking-[0.3em]"
                placeholder="000000"
              />
            </Field>
            <Field label={t("auth.forgot.newPassword")}>
              <input
                required
                minLength={6}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
              />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={submitting || code.length !== 6} className="btn-primary mt-1">
              {submitting ? t("auth.forgot.resetting") : t("auth.forgot.resetSubmit")}
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-center text-[13px] font-medium text-brand-700"
            >
              {t("auth.forgot.resend")}
            </button>
          </form>
        )}

        {step === "done" && (
          <div className="card flex flex-col items-center gap-4 text-center">
            <p className="text-[14px] text-slate-700">{t("auth.forgot.success")}</p>
            <button onClick={() => router.push("/login")} className="btn-primary">
              {t("auth.login.submit")}
            </button>
          </div>
        )}

        {step !== "done" && (
          <p className="mt-5 text-center text-sm text-slate-500">
            <Link href="/login" className="font-semibold text-brand-700">
              {t("auth.forgot.backToLogin")}
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

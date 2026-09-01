"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(emailOrPhone, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6faf7] px-4 py-14">
      <div className="app-container">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-card">
            <Wallet size={26} strokeWidth={2.2} />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-brand-950">Xush kelibsiz</h1>
          <p className="mt-1 text-sm text-slate-500">Hisobingizga kiring</p>
        </div>

        <form onSubmit={onSubmit} className="card flex flex-col gap-4">
          <Field label="Email yoki telefon">
            <input
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Parol">
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={submitting} className="btn-primary mt-1">
            {submitting ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Hisobingiz yo&apos;qmi?{" "}
          <Link href="/register" className="font-semibold text-brand-700">
            Ro&apos;yxatdan o&apos;ting
          </Link>
        </p>
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

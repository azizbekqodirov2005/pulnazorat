"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, Wallet } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") ?? undefined;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({ fullName, email, password, referralCode });
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
          <h1 className="mt-4 text-2xl font-bold text-brand-950">Boshlaylik</h1>
          <p className="mt-1 text-sm text-slate-500">Bepul hisob yarating, 30 soniyada tayyor</p>
        </div>

        {referralCode && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-[13px] text-brand-700">
            <UserPlus size={15} className="shrink-0" />
            Do&apos;stingiz sizni taklif qildi — ro&apos;yxatdan o&apos;tsangiz unga Pro ochilishiga yordam berasiz
          </div>
        )}

        <form onSubmit={onSubmit} className="card flex flex-col gap-4">
          <Field label="To'liq ism">
            <input
              required
              type="text"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Email">
            <input
              required
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Parol">
            <input
              required
              minLength={6}
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </Field>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={submitting} className="btn-primary mt-1">
            {submitting ? "Yaratilmoqda..." : "Ro'yxatdan o'tish"}
          </button>
        </form>

        <p className="mt-4 text-center text-[12px] text-slate-400">
          Ro&apos;yxatdan o&apos;tish orqali siz{" "}
          <Link href="/terms" className="font-medium text-slate-500 underline">
            foydalanish shartlari
          </Link>{" "}
          va{" "}
          <Link href="/privacy" className="font-medium text-slate-500 underline">
            maxfiylik siyosati
          </Link>
          ga rozilik bildirasiz
        </p>

        <p className="mt-3 text-center text-sm text-slate-500">
          Hisobingiz bormi?{" "}
          <Link href="/login" className="font-semibold text-brand-700">
            Kiring
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

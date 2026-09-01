"use client";

import { LogOut, Mail, Globe, Gift } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ReferralCard from "@/components/ReferralCard";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { t, lang } = useLanguage();

  return (
    <ProtectedRoute>
      <main className="app-container py-6 sm:py-8">
        <h1 className="text-xl font-bold text-slate-900">{t("profile.title")}</h1>

        <div className="mt-5 flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-card">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-bold text-brand-700">
            {user?.fullName
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()}
          </span>
          <p className="mt-3 text-[16px] font-bold text-slate-900">{user?.fullName}</p>
          <span className="mt-1.5 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
            {user?.plan === "pro" ? t("profile.proActive") : t("profile.free")}
          </span>
        </div>

        {user?.plan === "pro" ? (
          <div className="mt-4 card">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Gift size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-slate-800">{t("profile.proActiveTitle")}</p>
                <p className="text-[12px] text-slate-500">{t("profile.proActiveDesc")}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <ReferralCard />
          </div>
        )}

        <div className="mt-4 card divide-y divide-slate-100 p-0">
          <InfoRow icon={Mail} label={t("profile.email")} value={user?.email ?? "—"} />
          <InfoRow
            icon={Globe}
            label={t("profile.language")}
            value={lang === "uz" ? t("profile.langUz") : t("profile.langRu")}
          />
        </div>

        <button
          onClick={logout}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-[15px] font-semibold text-red-600 hover:bg-red-100"
        >
          <LogOut size={16} />
          {t("profile.logout")}
        </button>
      </main>
    </ProtectedRoute>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 first:pt-4 last:pb-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] text-slate-500">{label}</p>
        <p className="truncate text-[14px] font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

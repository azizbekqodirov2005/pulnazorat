"use client";

import Link from "next/link";
import { Wallet2, Target, HandCoins, Repeat, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

export default function ProFeaturesGrid() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isPro = user?.plan === "pro";

  const items = [
    { href: "/budgets", label: t("proFeatures.budgets"), icon: Wallet2 },
    { href: "/goals", label: t("proFeatures.goals"), icon: Target },
    { href: "/debts", label: t("proFeatures.debts"), icon: HandCoins },
    { href: "/recurring", label: t("proFeatures.recurring"), icon: Repeat },
  ];

  return (
    <div className="mt-4">
      <div className="mb-2.5 flex items-center gap-1.5">
        <p className="text-[13px] font-semibold text-slate-600">{t("dashboard.proFeatures")}</p>
        {!isPro && <Lock size={12} className="text-slate-400" />}
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="card relative flex flex-col items-center gap-1.5 p-3 text-center"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={18} />
              </span>
              <span className="text-[11px] font-medium leading-tight text-slate-600">{item.label}</span>
              {!isPro && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <Lock size={9} />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Wallet, PiggyBank, PieChart, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export default function LandingPage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 via-[#f6faf7] to-[#f6faf7]">
      <div className="app-container flex flex-col items-center pb-16 pt-14 text-center sm:pt-20">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-600 text-white shadow-card">
          <Wallet size={30} strokeWidth={2.2} />
        </span>

        <h1 className="mt-5 text-[28px] font-extrabold leading-tight tracking-tight text-brand-950 sm:text-3xl">
          {t("landing.title")}
        </h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-slate-500">{t("landing.subtitle")}</p>

        <div className="mt-7 flex w-full flex-col gap-2.5">
          <Link href="/register" className="btn-primary">
            {t("landing.ctaRegister")}
          </Link>
          <Link href="/login" className="btn-secondary">
            {t("landing.ctaLogin")}
          </Link>
        </div>

        <div className="mt-10 flex w-full flex-col gap-3 text-left">
          <Feature icon={PieChart} title={t("landing.feature1Title")} text={t("landing.feature1Text")} />
          <Feature icon={PiggyBank} title={t("landing.feature2Title")} text={t("landing.feature2Text")} />
          <Feature icon={ShieldCheck} title={t("landing.feature3Title")} text={t("landing.feature3Text")} />
        </div>

        <p className="mt-10 text-xs text-slate-400">{t("landing.footer")}</p>
      </div>
    </main>
  );
}

function Feature({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof PieChart;
  title: string;
  text: string;
}) {
  return (
    <div className="card flex items-start gap-3.5 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
        <Icon size={19} strokeWidth={2.2} />
      </span>
      <div>
        <h3 className="text-[14px] font-semibold text-slate-800">{title}</h3>
        <p className="mt-0.5 text-[13px] leading-relaxed text-slate-500">{text}</p>
      </div>
    </div>
  );
}

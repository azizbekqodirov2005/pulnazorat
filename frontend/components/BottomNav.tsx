"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ArrowLeftRight, UserRound, Code2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

export const TELEGRAM_GROUP_URL = "https://t.me/azbekdev";

export default function BottomNav() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  const tabs = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutGrid },
    { href: "/transactions", label: t("nav.transactions"), icon: ArrowLeftRight },
    { href: "/profile", label: t("nav.profile"), icon: UserRound },
  ];

  if (!user) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-nav backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-app items-stretch justify-around">
        {tabs.map((t2) => {
          const active = pathname === t2.href;
          const Icon = t2.icon;
          return (
            <Link
              key={t2.href}
              href={t2.href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5"
            >
              <Icon
                size={21}
                strokeWidth={active ? 2.4 : 2}
                className={active ? "text-brand-600" : "text-slate-400"}
              />
              <span className={`text-[11px] font-medium ${active ? "text-brand-700" : "text-slate-400"}`}>
                {t2.label}
              </span>
            </Link>
          );
        })}
        <a
          href={TELEGRAM_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 flex-col items-center gap-0.5 py-2.5"
        >
          <Code2 size={21} strokeWidth={2} className="text-slate-400" />
          <span className="text-[11px] font-medium text-slate-400">
            {t("nav.developer")}
          </span>
        </a>
      </div>
    </nav>
  );
}

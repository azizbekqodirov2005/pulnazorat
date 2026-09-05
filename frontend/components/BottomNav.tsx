"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ArrowLeftRight, UserRound } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

const TELEGRAM_GROUP_URL = "https://t.me/azbekdev";

function TelegramIcon({ className, size = 21 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M21.05 2.927a1.35 1.35 0 0 0-1.375-.234L2.7 9.36c-.98.386-.973 1.79.01 2.166l4.42 1.69 1.71 5.61c.207.678 1.05.898 1.556.404l2.46-2.395 4.34 3.328c.72.552 1.766.158 1.953-.727l3.42-16.02c.106-.5-.075-1.017-.514-1.29zM8.9 13.05l8.42-6.86c.2-.164.44.09.27.28l-6.98 7.86a.9.9 0 0 0-.216.42l-.32 2.06-1.174-3.76z" />
    </svg>
  );
}

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
          <TelegramIcon className="text-[#229ED9]" />
          <span className="text-[11px] font-medium text-[#229ED9]">
            {t("nav.telegram")}
          </span>
        </a>
      </div>
    </nav>
  );
}

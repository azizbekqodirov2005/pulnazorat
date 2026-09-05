"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useLanguage } from "@/lib/language-context";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: t("nav.dashboard") },
    { href: "/transactions", label: t("nav.transactions") },
    { href: "/profile", label: t("nav.profile") },
  ];

  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-1.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Wallet size={17} strokeWidth={2.3} />
          </span>
          <span className="text-[15px] font-bold tracking-tight text-brand-900">HamyonPro</span>
        </div>

        <nav className="hidden items-center gap-1 sm:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  active ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <span className="hidden rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700 sm:inline-block">
            {user.plan === "pro" ? "PRO" : "FREE"}
          </span>
          <span className="hidden text-sm font-medium text-slate-600 sm:inline">{user.fullName.split(" ")[0]}</span>
          <button
            onClick={() => setLang(lang === "uz" ? "ru" : "uz")}
            aria-label="Tilni almashtirish"
            className="flex h-8 min-w-8 items-center justify-center rounded-full px-1.5 text-[12px] font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            {lang === "uz" ? "UZ" : "RU"}
          </button>
          <button
            onClick={toggleTheme}
            aria-label="Rejimni almashtirish"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={logout}
            aria-label="Chiqish"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-600"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, PieChart as PieChartIcon, ChevronLeft, ChevronRight } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatCard from "@/components/StatCard";
import ProFeaturesGrid from "@/components/ProFeaturesGrid";
import { useAuth } from "@/lib/auth-context";
import { transactionsApi, Summary } from "@/lib/api";
import { formatSom, currentMonth, monthLabel, shiftMonth } from "@/lib/format";
import { useLanguage } from "@/lib/language-context";

const COLORS = ["#27824e", "#37a163", "#5bbb81", "#8ed3a8", "#bce6cc", "#0891b2", "#0ea5e9", "#94a3b8"];

export default function DashboardPage() {
  const { token, user } = useAuth();
  const { t, tCategory, lang } = useLanguage();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(currentMonth());
  const isCurrentMonth = month === currentMonth();

  useEffect(() => {
    if (!token) return;
    setSummary(null);
    transactionsApi
      .summary(token, month)
      .then(setSummary)
      .catch(() => setError(t("dashboard.loadError")));
  }, [token, month]); // eslint-disable-line react-hooks/exhaustive-deps

  const byCategory = (summary?.byCategory ?? []).map((c) => ({ ...c, name: tCategory(c.name) }));

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <p className="text-sm text-slate-500">
          {t("dashboard.hello")}, {user?.fullName.split(" ")[0]} 👋
        </p>
        <div className="mt-1 flex items-center justify-between">
          <button
            type="button"
            aria-label={t("dashboard.prevMonth")}
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">{monthLabel(month, lang)}</h1>
          <button
            type="button"
            aria-label={t("dashboard.nextMonth")}
            disabled={isCurrentMonth}
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-0"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {summary && (
          <>
            <div className="mt-5 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-card">
              <p className="text-[13px] font-medium text-brand-100">{t("dashboard.balance")}</p>
              <p className="mt-1 text-[32px] font-extrabold tracking-tight">{formatSom(summary.balance, lang)}</p>
              <div className="mt-4 flex gap-4 border-t border-white/15 pt-3.5 text-[13px]">
                <span className="flex items-center gap-1.5 text-brand-50">
                  <TrendingUp size={15} /> {formatSom(summary.income, lang)}
                </span>
                <span className="flex items-center gap-1.5 text-brand-50">
                  <TrendingDown size={15} /> {formatSom(summary.expense, lang)}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatCard
                label={t("dashboard.totalIncome")}
                value={formatSom(summary.income, lang)}
                icon={TrendingUp}
                tone="positive"
              />
              <StatCard
                label={t("dashboard.totalExpense")}
                value={formatSom(summary.expense, lang)}
                icon={TrendingDown}
                tone="negative"
              />
            </div>

            <ProFeaturesGrid />

            <div className="card mt-4">
              <div className="mb-3 flex items-center gap-2">
                <PieChartIcon size={16} className="text-brand-600" />
                <h2 className="font-semibold text-slate-800">{t("dashboard.byCategory")}</h2>
              </div>
              {byCategory.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">{t("dashboard.noExpenses")}</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={byCategory}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {byCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: unknown) => formatSom(Number(v ?? 0), lang)} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </ProtectedRoute>
  );
}

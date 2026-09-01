"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, PieChart as PieChartIcon } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatCard from "@/components/StatCard";
import ProFeaturesGrid from "@/components/ProFeaturesGrid";
import { useAuth } from "@/lib/auth-context";
import { transactionsApi, Summary } from "@/lib/api";
import { formatSom, currentMonth, monthLabel } from "@/lib/format";

const COLORS = ["#27824e", "#37a163", "#5bbb81", "#8ed3a8", "#bce6cc", "#0891b2", "#0ea5e9", "#94a3b8"];

export default function DashboardPage() {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const month = currentMonth();

  useEffect(() => {
    if (!token) return;
    transactionsApi
      .summary(token, month)
      .then(setSummary)
      .catch(() => setError("Ma'lumotlarni yuklab bo'lmadi"));
  }, [token, month]);

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
        <p className="text-sm text-slate-500">Salom, {user?.fullName.split(" ")[0]} 👋</p>
        <h1 className="text-xl font-bold text-slate-900">{monthLabel(month)}</h1>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {summary && (
          <>
            <div className="mt-5 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-card">
              <p className="text-[13px] font-medium text-brand-100">Joriy balans</p>
              <p className="mt-1 text-[32px] font-extrabold tracking-tight">{formatSom(summary.balance)}</p>
              <div className="mt-4 flex gap-4 border-t border-white/15 pt-3.5 text-[13px]">
                <span className="flex items-center gap-1.5 text-brand-50">
                  <TrendingUp size={15} /> {formatSom(summary.income)}
                </span>
                <span className="flex items-center gap-1.5 text-brand-50">
                  <TrendingDown size={15} /> {formatSom(summary.expense)}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <StatCard label="Jami kirim" value={formatSom(summary.income)} icon={TrendingUp} tone="positive" />
              <StatCard label="Jami chiqim" value={formatSom(summary.expense)} icon={TrendingDown} tone="negative" />
            </div>

            <ProFeaturesGrid />

            <div className="card mt-4">
              <div className="mb-3 flex items-center gap-2">
                <PieChartIcon size={16} className="text-brand-600" />
                <h2 className="font-semibold text-slate-800">Chiqimlar kategoriya bo&apos;yicha</h2>
              </div>
              {summary.byCategory.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  Bu oyda hali chiqim kiritilmagan.
                </p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summary.byCategory}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={2}
                      >
                        {summary.byCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: unknown) => formatSom(Number(v ?? 0))} />
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

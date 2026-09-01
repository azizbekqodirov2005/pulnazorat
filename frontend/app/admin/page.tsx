"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Users, Sparkles, Gift, Receipt, Search, Crown, X } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { adminApi, AdminStats, AdminUser } from "@/lib/api";

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminGate />
    </ProtectedRoute>
  );
}

function AdminGate() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  return <AdminDashboard />;
}

function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    if (!token) return;
    adminApi.stats(token).then(setStats).catch(() => {});
  }, [token]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
          <ShieldCheck size={19} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin panel</h1>
          <p className="text-[12px] text-slate-500">Statistika va foydalanuvchilarni boshqarish</p>
        </div>
      </div>

      {stats && <StatsGrid stats={stats} />}

      <div className="mt-6">
        <UsersSection />
      </div>
    </main>
  );
}

function StatsGrid({ stats }: { stats: AdminStats }) {
  const tiles = [
    { icon: Users, label: "Jami foydalanuvchi", value: stats.totalUsers },
    { icon: Sparkles, label: "Pro foydalanuvchi", value: stats.proUsers },
    { icon: Gift, label: "Referal orqali Pro", value: stats.proViaReferral },
    { icon: Crown, label: "Admin bergan Pro", value: stats.proViaAdminGrant },
    { icon: Receipt, label: "Jami tranzaksiya", value: stats.totalTransactions },
    { icon: Users, label: "Oxirgi 7 kunda qo'shilgan", value: stats.newUsersLast7Days },
  ];

  return (
    <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {tiles.map((t) => (
        <div key={t.label} className="card flex flex-col gap-2 p-3.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <t.icon size={15} />
          </span>
          <div>
            <p className="text-[18px] font-bold leading-none text-slate-900">{t.value}</p>
            <p className="mt-1 text-[11px] leading-tight text-slate-500">{t.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function UsersSection() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (q?: string) => {
      if (!token) return;
      try {
        const result = await adminApi.users(token, { search: q });
        setUsers(result.items);
      } catch {
        setError("Foydalanuvchilarni yuklab bo'lmadi");
      }
    },
    [token]
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const timeout = setTimeout(() => load(search || undefined), 350);
    return () => clearTimeout(timeout);
  }, [search, load]);

  async function handleGrant(id: string) {
    if (!token) return;
    setBusyId(id);
    try {
      await adminApi.grantPro(token, id);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, plan: "pro", proUnlockedVia: "admin_grant" } : u)));
    } finally {
      setBusyId(null);
    }
  }

  async function handleRevoke(id: string) {
    if (!token) return;
    setBusyId(id);
    try {
      await adminApi.revokePro(token, id);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, plan: "free", proUnlockedVia: null } : u)));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-semibold text-slate-800">Foydalanuvchilar</h2>
      </div>

      <div className="relative mb-3">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism, email yoki telefon bo'yicha qidirish"
          className="input pl-9"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            aria-label="Tozalash"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="card p-0">
        <ul className="divide-y divide-slate-100">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-[14px] font-semibold text-slate-800">
                  {u.fullName}
                  {u.role === "admin" && (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                      ADMIN
                    </span>
                  )}
                </p>
                <p className="truncate text-[12px] text-slate-500">{u.email ?? u.phone}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {u.referredCount} do&apos;st taklif qilgan
                  {u.plan === "pro" &&
                    (u.proUnlockedVia === "admin_grant"
                      ? " · Pro: admin bergan"
                      : u.proUnlockedVia === "referral"
                        ? " · Pro: referal orqali"
                        : "")}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  u.plan === "pro" ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-400"
                }`}
              >
                {u.plan === "pro" ? "PRO" : "FREE"}
              </span>

              {u.plan === "pro" ? (
                <button
                  onClick={() => handleRevoke(u.id)}
                  disabled={busyId === u.id}
                  className="btn-secondary w-auto shrink-0 border-red-100 px-3 py-1.5 text-[12px] text-red-600 hover:bg-red-50"
                >
                  Bekor qilish
                </button>
              ) : (
                <button
                  onClick={() => handleGrant(u.id)}
                  disabled={busyId === u.id}
                  className="btn-primary w-auto shrink-0 px-3 py-1.5 text-[12px]"
                >
                  Pro berish
                </button>
              )}
            </li>
          ))}
          {users.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-slate-400">Foydalanuvchi topilmadi</li>
          )}
        </ul>
      </div>
    </div>
  );
}

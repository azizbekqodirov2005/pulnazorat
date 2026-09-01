"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Target, Plus, PartyPopper } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProGate from "@/components/ProGate";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/lib/auth-context";
import { goalsApi, Goal } from "@/lib/api";
import { formatSom } from "@/lib/format";

export default function GoalsPage() {
  return (
    <ProtectedRoute>
      <main className="app-container py-6 sm:py-8">
        <h1 className="text-xl font-bold text-slate-900">Jamg&apos;arma maqsadlari</h1>
        <p className="mt-0.5 text-sm text-slate-500">Katta xarid yoki jamg&apos;arma uchun maqsad qo&apos;ying</p>
        <div className="mt-5">
          <ProGate
            title="Maqsadlar — Pro funksiya"
            description="Jamg'arma maqsadi qo'ying va unga qadam-baqadam pul qo'shib boring."
          >
            <GoalsContent />
          </ProGate>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function GoalsContent() {
  const { token } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [contributingId, setContributingId] = useState<string | null>(null);
  const [contributeValue, setContributeValue] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setGoals(await goalsApi.list(token));
    } catch {
      setError("Ma'lumotlarni yuklab bo'lmadi");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!token) return;
    await goalsApi.remove(token, id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  async function handleContribute(id: string) {
    if (!token) return;
    const amount = Number(contributeValue);
    if (!amount || amount <= 0) return;
    const updated = await goalsApi.contribute(token, id, amount);
    setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    setContributingId(null);
    setContributeValue("");
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {goals.length === 0 ? (
        <div className="card flex flex-col items-center py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <Target size={22} />
          </span>
          <p className="mt-3 text-sm text-slate-500">Hali maqsad yo&apos;q.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map((g) => {
            const ratio = g.currentAmount / g.targetAmount;
            const achieved = g.status === "achieved";
            return (
              <div key={g.id} className="card">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[14px] font-semibold text-slate-800">
                      {g.title}
                      {achieved && <PartyPopper size={15} className="text-amber-500" />}
                    </p>
                    <p className="text-[12px] text-slate-500">
                      {formatSom(g.currentAmount)} / {formatSom(g.targetAmount)}
                      {g.deadline && ` · ${new Date(g.deadline).toLocaleDateString("uz-UZ")}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(g.id)}
                    aria-label="O'chirish"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="mt-3">
                  <ProgressBar ratio={ratio} />
                </div>

                {!achieved &&
                  (contributingId === g.id ? (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="number"
                        min={1}
                        autoFocus
                        placeholder="Summa"
                        value={contributeValue}
                        onChange={(e) => setContributeValue(e.target.value)}
                        className="input"
                      />
                      <button onClick={() => handleContribute(g.id)} className="btn-primary w-auto px-4">
                        OK
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setContributingId(g.id)}
                      className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-brand-700"
                    >
                      <Plus size={14} /> Mablag&apos; qo&apos;shish
                    </button>
                  ))}
              </div>
            );
          })}
        </div>
      )}

      <GoalForm onCreated={load} />
    </div>
  );
}

function GoalForm({ onCreated }: { onCreated: () => void }) {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const amount = Number(targetAmount);
    if (!title || !amount || amount <= 0) {
      setError("Nom va summani to'ldiring");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await goalsApi.create(token, { title, targetAmount: amount, deadline: deadline || undefined });
      setTitle("");
      setTargetAmount("");
      setDeadline("");
      onCreated();
    } catch {
      setError("Maqsad qo'shib bo'lmadi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3">
      <p className="text-[13px] font-medium text-slate-600">Yangi maqsad qo&apos;shish</p>
      <input
        type="text"
        placeholder="Masalan: Mashina uchun"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input"
      />
      <input
        type="number"
        min={1}
        placeholder="Maqsad summasi (so'm)"
        value={targetAmount}
        onChange={(e) => setTargetAmount(e.target.value)}
        className="input"
      />
      <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={submitting} className="btn-primary">
        {submitting ? "Saqlanmoqda..." : "Qo'shish"}
      </button>
    </form>
  );
}

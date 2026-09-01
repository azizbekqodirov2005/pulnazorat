"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Target, Plus, PartyPopper, Pencil, X } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProGate from "@/components/ProGate";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/lib/auth-context";
import { goalsApi, Goal } from "@/lib/api";
import { formatSom, formatThousands } from "@/lib/format";
import { useToast } from "@/lib/toast-context";

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
  const { showToast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [contributingId, setContributingId] = useState<string | null>(null);
  const [contributeValue, setContributeValue] = useState("");
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

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

  async function handleUpdate(input: { title: string; targetAmount: number; deadline?: string }) {
    if (!token || !editingGoal) return;
    const updated = await goalsApi.update(token, editingGoal.id, input);
    setGoals((prev) => prev.map((g) => (g.id === editingGoal.id ? updated : g)));
    setEditingGoal(null);
    showToast("O'zgartirildi");
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
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setEditingGoal(g)}
                      aria-label="Tahrirlash"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:bg-brand-50 hover:text-brand-600"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      aria-label="O'chirish"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar ratio={ratio} />
                </div>

                {!achieved &&
                  (contributingId === g.id ? (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        autoFocus
                        placeholder="Summa"
                        value={formatThousands(contributeValue)}
                        onChange={(e) => setContributeValue(e.target.value.replace(/\D/g, ""))}
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

      {editingGoal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setEditingGoal(null)}
        >
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">Maqsadni tahrirlash</h2>
              <button
                onClick={() => setEditingGoal(null)}
                aria-label="Yopish"
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            <GoalForm
              onCreated={load}
              onUpdate={handleUpdate}
              onCancel={() => setEditingGoal(null)}
              initialValues={{
                title: editingGoal.title,
                targetAmount: editingGoal.targetAmount,
                deadline: editingGoal.deadline ?? undefined,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function GoalForm({
  onCreated,
  onUpdate,
  onCancel,
  initialValues,
}: {
  onCreated: () => void;
  onUpdate?: (input: { title: string; targetAmount: number; deadline?: string }) => Promise<void>;
  onCancel?: () => void;
  initialValues?: { title: string; targetAmount: number; deadline?: string };
}) {
  const { token } = useAuth();
  const isEditing = Boolean(initialValues);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [targetAmount, setTargetAmount] = useState(initialValues ? String(initialValues.targetAmount) : "");
  const [deadline, setDeadline] = useState(initialValues?.deadline ?? "");
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
      if (isEditing && onUpdate) {
        await onUpdate({ title, targetAmount: amount, deadline: deadline || undefined });
      } else {
        await goalsApi.create(token, { title, targetAmount: amount, deadline: deadline || undefined });
        setTitle("");
        setTargetAmount("");
        setDeadline("");
        onCreated();
      }
    } catch {
      setError(isEditing ? "Maqsadni yangilab bo'lmadi" : "Maqsad qo'shib bo'lmadi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3">
      {!isEditing && <p className="text-[13px] font-medium text-slate-600">Yangi maqsad qo&apos;shish</p>}
      <input
        type="text"
        placeholder="Masalan: Mashina uchun"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input"
      />
      <input
        type="text"
        inputMode="numeric"
        placeholder="Maqsad summasi (so'm)"
        value={formatThousands(targetAmount)}
        onChange={(e) => setTargetAmount(e.target.value.replace(/\D/g, ""))}
        className="input"
      />
      <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="input" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Bekor qilish
          </button>
        )}
        <button disabled={submitting} className="btn-primary flex-1">
          {submitting ? "Saqlanmoqda..." : isEditing ? "Saqlash" : "Qo'shish"}
        </button>
      </div>
    </form>
  );
}

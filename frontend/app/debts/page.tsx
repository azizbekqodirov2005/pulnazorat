"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, HandCoins, Check } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProGate from "@/components/ProGate";
import { useAuth } from "@/lib/auth-context";
import { debtsApi, Debt } from "@/lib/api";
import { formatSom } from "@/lib/format";

export default function DebtsPage() {
  return (
    <ProtectedRoute>
      <main className="app-container py-6 sm:py-8">
        <h1 className="text-xl font-bold text-slate-900">Qarz-nasiya</h1>
        <p className="mt-0.5 text-sm text-slate-500">Kimga qarzdorsiz, kim sizga qarzdor — hammasi bir joyda</p>
        <div className="mt-5">
          <ProGate
            title="Qarz-nasiya — Pro funksiya"
            description="Kimdan qarz oldingiz, kimga berdingiz — unutmasdan kuzatib boring."
          >
            <DebtsContent />
          </ProGate>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function DebtsContent() {
  const { token } = useAuth();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setDebts(await debtsApi.list(token));
    } catch {
      setError("Ma'lumotlarni yuklab bo'lmadi");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleClose(id: string) {
    if (!token) return;
    const updated = await debtsApi.close(token, id);
    setDebts((prev) => prev.map((d) => (d.id === id ? updated : d)));
  }

  async function handleDelete(id: string) {
    if (!token) return;
    await debtsApi.remove(token, id);
    setDebts((prev) => prev.filter((d) => d.id !== id));
  }

  const open = debts.filter((d) => d.status === "open");
  const closed = debts.filter((d) => d.status === "closed");

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {debts.length === 0 ? (
        <div className="card flex flex-col items-center py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <HandCoins size={22} />
          </span>
          <p className="mt-3 text-sm text-slate-500">Hali qarz yozuvi yo&apos;q.</p>
        </div>
      ) : (
        <>
          {open.length > 0 && (
            <div className="card p-0">
              <p className="px-4 pt-4 text-[12px] font-semibold uppercase tracking-wide text-slate-400">Ochiq</p>
              <ul className="divide-y divide-slate-100">
                {open.map((d) => (
                  <DebtRow key={d.id} debt={d} onClose={handleClose} onDelete={handleDelete} />
                ))}
              </ul>
            </div>
          )}
          {closed.length > 0 && (
            <div className="card p-0 opacity-70">
              <p className="px-4 pt-4 text-[12px] font-semibold uppercase tracking-wide text-slate-400">Yopilgan</p>
              <ul className="divide-y divide-slate-100">
                {closed.map((d) => (
                  <DebtRow key={d.id} debt={d} onClose={handleClose} onDelete={handleDelete} />
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <DebtForm onCreated={load} />
    </div>
  );
}

function DebtRow({
  debt,
  onClose,
  onDelete,
}: {
  debt: Debt;
  onClose: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const owedToMe = debt.direction === "owed_to_me";
  return (
    <li className="flex items-center gap-3 px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-slate-800">{debt.personName}</p>
        <p className="text-[12px] text-slate-500">
          {owedToMe ? "Menga qarzdor" : "Men qarzdorman"}
          {debt.dueDate && ` · ${new Date(debt.dueDate).toLocaleDateString("uz-UZ")}`}
        </p>
      </div>
      <span className={`text-[14px] font-bold ${owedToMe ? "text-emerald-600" : "text-red-600"}`}>
        {formatSom(debt.amount)}
      </span>
      {debt.status === "open" && (
        <button
          onClick={() => onClose(debt.id)}
          aria-label="Yopish"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-300 hover:bg-emerald-50 hover:text-emerald-600"
        >
          <Check size={15} />
        </button>
      )}
      <button
        onClick={() => onDelete(debt.id)}
        aria-label="O'chirish"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500"
      >
        <Trash2 size={14} />
      </button>
    </li>
  );
}

function DebtForm({ onCreated }: { onCreated: () => void }) {
  const { token } = useAuth();
  const [personName, setPersonName] = useState("");
  const [direction, setDirection] = useState<"owed_to_me" | "i_owe">("owed_to_me");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const numAmount = Number(amount);
    if (!personName || !numAmount || numAmount <= 0) {
      setError("Ism va summani to'ldiring");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await debtsApi.create(token, { personName, direction, amount: numAmount, dueDate: dueDate || undefined });
      setPersonName("");
      setAmount("");
      setDueDate("");
      onCreated();
    } catch {
      setError("Qarz yozib bo'lmadi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3">
      <p className="text-[13px] font-medium text-slate-600">Yangi qarz yozuvi</p>

      <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setDirection("owed_to_me")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            direction === "owed_to_me" ? "bg-white text-emerald-600 shadow-soft" : "text-slate-500"
          }`}
        >
          Menga qarzdor
        </button>
        <button
          type="button"
          onClick={() => setDirection("i_owe")}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            direction === "i_owe" ? "bg-white text-red-600 shadow-soft" : "text-slate-500"
          }`}
        >
          Men qarzdorman
        </button>
      </div>

      <input
        type="text"
        placeholder="Ism"
        value={personName}
        onChange={(e) => setPersonName(e.target.value)}
        className="input"
      />
      <input
        type="number"
        min={1}
        placeholder="Summa (so'm)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="input"
      />
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="input" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={submitting} className="btn-primary">
        {submitting ? "Saqlanmoqda..." : "Qo'shish"}
      </button>
    </form>
  );
}

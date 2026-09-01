"use client";

import { FormEvent, useState } from "react";
import { Category } from "@/lib/api";
import { todayIso, currentMonth, monthLabel } from "@/lib/format";

export interface TransactionFormValues {
  type: "income" | "expense";
  categoryId: string;
  amount: number;
  note?: string;
  occurredOn: string;
}

export default function TransactionForm({
  categories,
  onSubmit,
  submitting,
}: {
  categories: Category[];
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  submitting: boolean;
}) {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [occurredOn, setOccurredOn] = useState(todayIso());
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => c.type === type);
  const occurredMonth = occurredOn.slice(0, 7);
  const isOtherMonth = occurredMonth.length === 7 && occurredMonth !== currentMonth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const numericAmount = Number(amount);
    if (!categoryId) {
      setError("Kategoriyani tanlang");
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setError("Summani to'g'ri kiriting");
      return;
    }
    if (occurredOn > todayIso()) {
      setError("Kelajakdagi sana kiritib bo'lmaydi — bugungi yoki oldingi sanani tanlang");
      return;
    }
    await onSubmit({ type, categoryId, amount: numericAmount, note: note || undefined, occurredOn });
    setAmount("");
    setNote("");
    setCategoryId("");
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
      <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setType("expense");
            setCategoryId("");
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            type === "expense" ? "bg-white text-red-600 shadow-soft" : "text-slate-500"
          }`}
        >
          Chiqim
        </button>
        <button
          type="button"
          onClick={() => {
            setType("income");
            setCategoryId("");
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            type === "income" ? "bg-white text-emerald-600 shadow-soft" : "text-slate-500"
          }`}
        >
          Kirim
        </button>
      </div>

      <div>
        <p className="mb-2 text-[13px] font-medium text-slate-600">Kategoriya</p>
        <div className="grid grid-cols-3 gap-2">
          {filteredCategories.map((c) => {
            const active = categoryId === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-colors ${
                  active
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span className="text-lg leading-none">{c.icon}</span>
                <span className="line-clamp-1 text-[11px] font-medium">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-slate-600">Summa</span>
        <input
          type="number"
          min={1}
          step="0.01"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-slate-600">Sana</span>
        <input
          type="date"
          value={occurredOn}
          max={todayIso()}
          onChange={(e) => setOccurredOn(e.target.value)}
          className="input"
        />
        {isOtherMonth && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-700">
            Diqqat: bu — o&apos;tgan sana. Ushbu {type === "income" ? "kirim" : "chiqim"}{" "}
            <strong>{monthLabel(occurredMonth)}</strong> oyi xulosasiga yoziladi, joriy oy dashboard&apos;ida
            ko&apos;rinmaydi.
          </p>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-slate-600">Izoh (ixtiyoriy)</span>
        <input
          type="text"
          placeholder="masalan: Bozor"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button disabled={submitting} className="btn-primary">
        {submitting ? "Saqlanmoqda..." : "Qo'shish"}
      </button>
    </form>
  );
}

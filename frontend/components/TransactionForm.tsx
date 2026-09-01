"use client";

import { FormEvent, useState } from "react";
import { Category } from "@/lib/api";
import { todayIso, currentMonth, monthLabel, formatThousands } from "@/lib/format";
import { useLanguage } from "@/lib/language-context";

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
  initialValues,
  submitLabel,
  onCancel,
}: {
  categories: Category[];
  onSubmit: (values: TransactionFormValues) => Promise<void>;
  submitting: boolean;
  initialValues?: TransactionFormValues;
  submitLabel?: string;
  onCancel?: () => void;
}) {
  const { t, tCategory, lang } = useLanguage();
  const isEditing = Boolean(initialValues);
  const [type, setType] = useState<"income" | "expense">(initialValues?.type ?? "expense");
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? "");
  const [amount, setAmount] = useState(initialValues ? String(initialValues.amount) : "");
  const [note, setNote] = useState(initialValues?.note ?? "");
  const [occurredOn, setOccurredOn] = useState(initialValues?.occurredOn ?? todayIso());
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => c.type === type);
  const occurredMonth = occurredOn.slice(0, 7);
  const isOtherMonth = occurredMonth.length === 7 && occurredMonth !== currentMonth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const numericAmount = Number(amount);
    if (!categoryId) {
      setError(t("tx.categoryRequired"));
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      setError(t("tx.amountRequired"));
      return;
    }
    if (occurredOn > todayIso()) {
      setError(t("tx.futureDateError"));
      return;
    }
    await onSubmit({ type, categoryId, amount: numericAmount, note: note || undefined, occurredOn });
    if (!isEditing) {
      setAmount("");
      setNote("");
      setCategoryId("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
      <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          disabled={isEditing}
          onClick={() => {
            setType("expense");
            setCategoryId("");
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            type === "expense" ? "bg-white text-red-600 shadow-soft" : "text-slate-500"
          } ${isEditing ? "cursor-not-allowed opacity-60" : ""}`}
        >
          {t("tx.expense")}
        </button>
        <button
          type="button"
          disabled={isEditing}
          onClick={() => {
            setType("income");
            setCategoryId("");
          }}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            type === "income" ? "bg-white text-emerald-600 shadow-soft" : "text-slate-500"
          } ${isEditing ? "cursor-not-allowed opacity-60" : ""}`}
        >
          {t("tx.income")}
        </button>
      </div>
      {isEditing && <p className="-mt-2 text-[12px] text-slate-400">{t("tx.editLockNote")}</p>}

      <div>
        <p className="mb-2 text-[13px] font-medium text-slate-600">{t("tx.category")}</p>
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
                <span className="line-clamp-1 text-[11px] font-medium">{tCategory(c.name)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-slate-600">{t("tx.amount")}</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={formatThousands(amount)}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          className="input"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-slate-600">{t("tx.date")}</span>
        <input
          type="date"
          value={occurredOn}
          max={todayIso()}
          onChange={(e) => setOccurredOn(e.target.value)}
          className="input"
        />
        {isOtherMonth && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-700">
            {t("tx.pastMonthWarning", {
              type: type === "income" ? t("tx.income").toLowerCase() : t("tx.expense").toLowerCase(),
              month: monthLabel(occurredMonth, lang),
            })}
          </p>
        )}
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-slate-600">{t("tx.note")}</span>
        <input
          type="text"
          placeholder={t("tx.notePlaceholder")}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="input"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            {t("common.cancel")}
          </button>
        )}
        <button disabled={submitting} className="btn-primary flex-1">
          {submitting ? t("common.saving") : submitLabel ?? t("common.add")}
        </button>
      </div>
    </form>
  );
}

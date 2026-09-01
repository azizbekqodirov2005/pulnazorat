"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Wallet2, Pencil, Check, X } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProGate from "@/components/ProGate";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/lib/auth-context";
import { budgetsApi, categoriesApi, Budget, Category } from "@/lib/api";
import { formatSom, currentMonth } from "@/lib/format";
import { useToast } from "@/lib/toast-context";

export default function BudgetsPage() {
  return (
    <ProtectedRoute>
      <main className="app-container py-6 sm:py-8">
        <h1 className="text-xl font-bold text-slate-900">Byudjet</h1>
        <p className="mt-0.5 text-sm text-slate-500">Kategoriya bo&apos;yicha oylik limit belgilang</p>
        <div className="mt-5">
          <ProGate
            title="Byudjet — Pro funksiya"
            description="Har bir kategoriya uchun oylik xarajat limitini belgilang va oshib ketishdan oldin ogohlantirish oling."
          >
            <BudgetsContent />
          </ProGate>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function BudgetsContent() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const month = currentMonth();

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [b, c] = await Promise.all([budgetsApi.list(token, month), categoriesApi.list(token)]);
      setBudgets(b);
      setCategories(c.filter((cat) => cat.type === "expense"));
    } catch {
      setError("Ma'lumotlarni yuklab bo'lmadi");
    }
  }, [token, month]);

  useEffect(() => {
    load();
  }, [load]);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const availableCategories = categories.filter((c) => !budgets.some((b) => b.categoryId === c.id));

  async function handleDelete(id: string) {
    if (!token) return;
    await budgetsApi.remove(token, id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }

  function startEdit(b: Budget) {
    setEditingId(b.id);
    setEditValue(String(b.limitAmount));
  }

  async function saveEdit(id: string) {
    if (!token) return;
    const amount = Number(editValue);
    if (!amount || amount <= 0) return;
    setSavingEdit(true);
    try {
      const updated = await budgetsApi.update(token, id, amount);
      setBudgets((prev) => prev.map((b) => (b.id === id ? updated : b)));
      setEditingId(null);
      showToast("O'zgartirildi");
    } catch {
      setError("Byudjetni yangilab bo'lmadi");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {budgets.length === 0 ? (
        <div className="card flex flex-col items-center py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <Wallet2 size={22} />
          </span>
          <p className="mt-3 text-sm text-slate-500">Hali byudjet belgilanmagan.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {budgets.map((b) => {
            const category = categoryMap.get(b.categoryId);
            const ratio = b.spent / b.limitAmount;
            const isEditing = editingId === b.id;
            return (
              <div key={b.id} className="card">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{category?.icon ?? "💳"}</span>
                    <div>
                      <p className="text-[14px] font-semibold text-slate-800">{category?.name ?? "Kategoriya"}</p>
                      {isEditing ? (
                        <div className="mt-1 flex items-center gap-1.5">
                          <input
                            autoFocus
                            type="number"
                            min={1}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="input h-8 w-28 py-1 text-[13px]"
                          />
                          <button
                            onClick={() => saveEdit(b.id)}
                            disabled={savingEdit}
                            aria-label="Saqlash"
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            aria-label="Bekor qilish"
                            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <p className="text-[12px] text-slate-500">
                          {formatSom(b.spent)} / {formatSom(b.limitAmount)}
                        </p>
                      )}
                    </div>
                  </div>
                  {!isEditing && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => startEdit(b)}
                        aria-label="Tahrirlash"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:bg-brand-50 hover:text-brand-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        aria-label="O'chirish"
                        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <ProgressBar ratio={ratio} />
                </div>
                {ratio >= 1 && (
                  <p className="mt-1.5 text-[12px] font-medium text-red-600">Limitdan oshib ketdi</p>
                )}
                {ratio >= 0.8 && ratio < 1 && (
                  <p className="mt-1.5 text-[12px] font-medium text-amber-600">Limitga yaqinlashdi</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {availableCategories.length > 0 && (
        <BudgetForm categories={availableCategories} month={month} onCreated={load} />
      )}
    </div>
  );
}

function BudgetForm({
  categories,
  month,
  onCreated,
}: {
  categories: Category[];
  month: string;
  onCreated: () => void;
}) {
  const { token } = useAuth();
  const [categoryId, setCategoryId] = useState("");
  const [limitAmount, setLimitAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const amount = Number(limitAmount);
    if (!categoryId || !amount || amount <= 0) {
      setError("Kategoriya va summani to'ldiring");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await budgetsApi.create(token, { categoryId, limitAmount: amount, periodMonth: month });
      setCategoryId("");
      setLimitAmount("");
      onCreated();
    } catch {
      setError("Byudjet qo'shib bo'lmadi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3">
      <p className="text-[13px] font-medium text-slate-600">Yangi byudjet qo&apos;shish</p>
      <div className="grid grid-cols-3 gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategoryId(c.id)}
            className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center transition-colors ${
              categoryId === c.id
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
            }`}
          >
            <span className="text-lg leading-none">{c.icon}</span>
            <span className="line-clamp-1 text-[11px] font-medium">{c.name}</span>
          </button>
        ))}
      </div>
      <input
        type="number"
        min={1}
        placeholder="Oylik limit (so'm)"
        value={limitAmount}
        onChange={(e) => setLimitAmount(e.target.value)}
        className="input"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={submitting} className="btn-primary">
        {submitting ? "Saqlanmoqda..." : "Qo'shish"}
      </button>
    </form>
  );
}

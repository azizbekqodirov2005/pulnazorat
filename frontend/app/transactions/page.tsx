"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Receipt } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TransactionForm, { TransactionFormValues } from "@/components/TransactionForm";
import { useAuth } from "@/lib/auth-context";
import { categoriesApi, transactionsApi, Category, Transaction } from "@/lib/api";
import { formatSom } from "@/lib/format";

export default function TransactionsPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [cats, txs] = await Promise.all([
        categoriesApi.list(token),
        transactionsApi.list(token, { page: 1, pageSize: 50 }),
      ]);
      setCategories(cats);
      setTransactions(txs.items);
    } catch {
      setError("Ma'lumotlarni yuklab bo'lmadi");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(values: TransactionFormValues) {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await transactionsApi.create(token, values);
      await load();
    } catch {
      setError("Tranzaksiyani saqlab bo'lmadi");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    await transactionsApi.remove(token, id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ProtectedRoute>
      <main className="app-container-wide py-6 sm:py-8">
        <h1 className="text-xl font-bold text-slate-900">Tranzaksiyalar</h1>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
          <TransactionForm categories={categories} onSubmit={handleCreate} submitting={submitting} />

          <div className="card p-0">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                  <Receipt size={22} />
                </span>
                <p className="mt-3 text-sm text-slate-500">
                  Hali tranzaksiya yo&apos;q — chapdagi (yoki yuqoridagi) formadan qo&apos;shing.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {transactions.map((t) => {
                  const category = categoryMap.get(t.categoryId);
                  const positive = t.type === "income";
                  return (
                    <li key={t.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                          positive ? "bg-emerald-50" : "bg-slate-50"
                        }`}
                      >
                        {category?.icon ?? "💳"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-slate-800">
                          {category?.name ?? "Kategoriya"}
                        </p>
                        <p className="truncate text-[12px] text-slate-500">
                          {t.note ? `${t.note} · ` : ""}
                          {t.occurredOn.slice(0, 10)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <span
                          className={`text-[14px] font-bold ${positive ? "text-emerald-600" : "text-slate-800"}`}
                        >
                          {positive ? "+" : "-"}
                          {formatSom(t.amount)}
                        </span>
                        <button
                          onClick={() => handleDelete(t.id)}
                          aria-label="O'chirish"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

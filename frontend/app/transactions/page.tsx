"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Receipt, Pencil, X } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import TransactionForm, { TransactionFormValues } from "@/components/TransactionForm";
import { useAuth } from "@/lib/auth-context";
import { categoriesApi, transactionsApi, Category, Transaction } from "@/lib/api";
import { formatSom } from "@/lib/format";
import { useLanguage } from "@/lib/language-context";
import { useToast } from "@/lib/toast-context";

export default function TransactionsPage() {
  const { token } = useAuth();
  const { t, tCategory, lang } = useLanguage();
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

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
      setError(t("tx.loadError"));
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

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
      showToast(t("tx.addedToast"));
    } catch {
      setError(t("tx.createError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(values: TransactionFormValues) {
    if (!token || !editingTx) return;
    setSubmitting(true);
    setError(null);
    try {
      await transactionsApi.update(token, editingTx.id, {
        categoryId: values.categoryId,
        amount: values.amount,
        note: values.note,
        occurredOn: values.occurredOn,
      });
      await load();
      setEditingTx(null);
      showToast(t("tx.updatedToast"));
    } catch {
      setError(t("tx.updateError"));
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(tx: Transaction) {
    if (!token) return;
    const index = transactions.findIndex((item) => item.id === tx.id);
    // Optimistik: darhol ro'yxatdan olib tashlaymiz, lekin 5 soniya ichida
    // "Bekor qilish" bosilmasa, shundagina serverga o'chirish so'rovi ketadi.
    setTransactions((prev) => prev.filter((item) => item.id !== tx.id));

    const restore = () => {
      setTransactions((prev) => {
        if (prev.some((item) => item.id === tx.id)) return prev;
        const next = [...prev];
        next.splice(Math.min(index, next.length), 0, tx);
        return next;
      });
    };

    showToast(t("tx.deletedToast"), {
      duration: 5000,
      actionLabel: t("tx.deleteUndo"),
      onAction: restore,
      onExpire: () => {
        transactionsApi.remove(token, tx.id).catch(() => {
          restore();
          setError(t("tx.deleteError"));
        });
      },
    });
  }

  return (
    <ProtectedRoute>
      <main className="app-container-wide py-6 sm:py-8">
        <h1 className="text-xl font-bold text-slate-900">{t("tx.title")}</h1>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
          <TransactionForm categories={categories} onSubmit={handleCreate} submitting={submitting} />

          <div className="card p-0">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                  <Receipt size={22} />
                </span>
                <p className="mt-3 text-sm text-slate-500">{t("tx.empty")}</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {transactions.map((tx) => {
                  const category = categoryMap.get(tx.categoryId);
                  const positive = tx.type === "income";
                  return (
                    <li key={tx.id} className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${
                          positive ? "bg-emerald-50" : "bg-slate-50"
                        }`}
                      >
                        {category?.icon ?? "💳"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-slate-800">
                          {category ? tCategory(category.name) : t("tx.category")}
                        </p>
                        <p className="truncate text-[12px] text-slate-500">
                          {tx.note ? `${tx.note} · ` : ""}
                          {tx.occurredOn.slice(0, 10)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span
                          className={`text-[14px] font-bold ${positive ? "text-emerald-600" : "text-slate-800"}`}
                        >
                          {positive ? "+" : "-"}
                          {formatSom(tx.amount, lang)}
                        </span>
                        <button
                          onClick={() => setEditingTx(tx)}
                          aria-label={t("tx.editAria")}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-300 hover:bg-brand-50 hover:text-brand-600"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(tx)}
                          aria-label={t("tx.deleteAria")}
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

        {editingTx && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
            onClick={() => setEditingTx(null)}
          >
            <div
              className="w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">{t("tx.editTitle")}</h2>
                <button
                  onClick={() => setEditingTx(null)}
                  aria-label={t("common.close")}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>
              <TransactionForm
                categories={categories}
                submitting={submitting}
                onSubmit={handleUpdate}
                onCancel={() => setEditingTx(null)}
                submitLabel={t("common.save")}
                initialValues={{
                  type: editingTx.type,
                  categoryId: editingTx.categoryId,
                  amount: editingTx.amount,
                  note: editingTx.note ?? undefined,
                  occurredOn: editingTx.occurredOn.slice(0, 10),
                }}
              />
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}

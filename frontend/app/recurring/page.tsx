"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Repeat, BellRing, Pencil, X } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProGate from "@/components/ProGate";
import { useAuth } from "@/lib/auth-context";
import { recurringApi, RecurringPayment } from "@/lib/api";
import { formatSom, formatThousands } from "@/lib/format";
import { isReminderDueSoon } from "@/lib/reminders";
import { useToast } from "@/lib/toast-context";

export default function RecurringPage() {
  return (
    <ProtectedRoute>
      <main className="app-container py-6 sm:py-8">
        <h1 className="text-xl font-bold text-slate-900">Takrorlanuvchi to&apos;lovlar</h1>
        <p className="mt-0.5 text-sm text-slate-500">Ijara, internet kabi doimiy to&apos;lovlar uchun eslatma</p>
        <div className="mt-5">
          <ProGate
            title="Eslatmalar — Pro funksiya"
            description="Har oy takrorlanadigan to'lovlaringiz uchun muddatidan oldin eslatma oling."
          >
            <RecurringContent />
          </ProGate>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function RecurringContent() {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<RecurringPayment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<RecurringPayment | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setItems(await recurringApi.list(token));
    } catch {
      setError("Ma'lumotlarni yuklab bo'lmadi");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleActive(item: RecurringPayment) {
    if (!token) return;
    const updated = await recurringApi.update(token, item.id, { isActive: !item.isActive });
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  }

  async function handleDelete(id: string) {
    if (!token) return;
    await recurringApi.remove(token, id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleUpdate(input: {
    title: string;
    amount: number;
    dueDay: number;
    reminderDaysBefore: number;
  }) {
    if (!token || !editingItem) return;
    const updated = await recurringApi.update(token, editingItem.id, input);
    setItems((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
    setEditingItem(null);
    showToast("O'zgartirildi");
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {items.length === 0 ? (
        <div className="card flex flex-col items-center py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            <Repeat size={22} />
          </span>
          <p className="mt-3 text-sm text-slate-500">Hali takrorlanuvchi to&apos;lov qo&apos;shilmagan.</p>
        </div>
      ) : (
        <div className="card p-0">
          <ul className="divide-y divide-slate-100">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <BellRing size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-slate-800">{i.title}</p>
                  <p className="text-[12px] text-slate-500">
                    Har oyning {i.dueDay}-kuni · {i.reminderDaysBefore} kun oldin eslatiladi
                  </p>
                </div>
                {isReminderDueSoon(i) && (
                  <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                    Yaqinlashmoqda
                  </span>
                )}
                <span className="shrink-0 text-[14px] font-bold text-slate-800">{formatSom(i.amount)}</span>
                <button
                  onClick={() => toggleActive(i)}
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    i.isActive ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i.isActive ? "Faol" : "O'chirilgan"}
                </button>
                <button
                  onClick={() => setEditingItem(i)}
                  aria-label="Tahrirlash"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-300 hover:bg-brand-50 hover:text-brand-600"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(i.id)}
                  aria-label="O'chirish"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <RecurringForm onCreated={load} />

      {editingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setEditingItem(null)}
        >
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">To&apos;lovni tahrirlash</h2>
              <button
                onClick={() => setEditingItem(null)}
                aria-label="Yopish"
                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
            <RecurringForm
              onCreated={load}
              onUpdate={handleUpdate}
              onCancel={() => setEditingItem(null)}
              initialValues={{
                title: editingItem.title,
                amount: editingItem.amount,
                dueDay: editingItem.dueDay,
                reminderDaysBefore: editingItem.reminderDaysBefore,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RecurringForm({
  onCreated,
  onUpdate,
  onCancel,
  initialValues,
}: {
  onCreated: () => void;
  onUpdate?: (input: { title: string; amount: number; dueDay: number; reminderDaysBefore: number }) => Promise<void>;
  onCancel?: () => void;
  initialValues?: { title: string; amount: number; dueDay: number; reminderDaysBefore: number };
}) {
  const { token } = useAuth();
  const isEditing = Boolean(initialValues);
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [amount, setAmount] = useState(initialValues ? String(initialValues.amount) : "");
  const [dueDay, setDueDay] = useState(initialValues ? String(initialValues.dueDay) : "");
  const [reminderDaysBefore, setReminderDaysBefore] = useState(
    initialValues ? String(initialValues.reminderDaysBefore) : "2"
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const numAmount = Number(amount);
    const day = Number(dueDay);
    if (!title || !numAmount || numAmount <= 0 || !day || day < 1 || day > 31) {
      setError("Barcha maydonlarni to'g'ri to'ldiring (kun 1-31 oralig'ida)");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      if (isEditing && onUpdate) {
        await onUpdate({
          title,
          amount: numAmount,
          dueDay: day,
          reminderDaysBefore: Number(reminderDaysBefore) || 1,
        });
      } else {
        await recurringApi.create(token, {
          title,
          amount: numAmount,
          dueDay: day,
          reminderDaysBefore: Number(reminderDaysBefore) || 1,
        });
        setTitle("");
        setAmount("");
        setDueDay("");
        onCreated();
      }
    } catch {
      setError(isEditing ? "Yangilab bo'lmadi" : "Qo'shib bo'lmadi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex flex-col gap-3">
      {!isEditing && <p className="text-[13px] font-medium text-slate-600">Yangi to&apos;lov qo&apos;shish</p>}
      <input
        type="text"
        placeholder="Masalan: Ijara"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input"
      />
      <input
        type="text"
        inputMode="numeric"
        placeholder="Summa (so'm)"
        value={formatThousands(amount)}
        onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
        className="input"
      />
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-slate-500">Oyning kuni</span>
          <input
            type="number"
            min={1}
            max={31}
            placeholder="1-31"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            className="input"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-slate-500">Necha kun oldin</span>
          <input
            type="number"
            min={0}
            max={30}
            value={reminderDaysBefore}
            onChange={(e) => setReminderDaysBefore(e.target.value)}
            className="input"
          />
        </label>
      </div>
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

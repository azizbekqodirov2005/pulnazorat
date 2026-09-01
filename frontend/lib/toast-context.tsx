"use client";

import { createContext, useCallback, useContext, useRef, useState, ReactNode } from "react";

interface ToastItem {
  id: number;
  message: string;
  duration: number;
  actionLabel?: string;
  onAction?: () => void;
  onExpire?: () => void;
}

interface ShowToastOptions {
  /** Necha millisekund ko'rinib turadi (standart: 2500ms). Bekor qilish tugmasi bo'lsa, odatda 5000ms beriladi. */
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  /** Vaqt tugab, hech kim bekor qilmasa chaqiriladi (masalan, haqiqiy o'chirish so'rovi shu yerda yuboriladi). */
  onExpire?: () => void;
}

interface ToastContextValue {
  showToast: (message: string, options?: ShowToastOptions) => number;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: number, runExpire: boolean) => {
    setToasts((prev) => {
      const item = prev.find((t) => t.id === id);
      if (runExpire) item?.onExpire?.();
      return prev.filter((t) => t.id !== id);
    });
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, options: ShowToastOptions = {}) => {
      const id = ++idCounter;
      const duration = options.duration ?? 2500;
      const item: ToastItem = {
        id,
        message,
        duration,
        actionLabel: options.actionLabel,
        onAction: options.onAction,
        onExpire: options.onExpire,
      };
      setToasts((prev) => [...prev, item]);
      timers.current.set(
        id,
        setTimeout(() => removeToast(id, true), duration)
      );
      return id;
    },
    [removeToast]
  );

  function handleAction(item: ToastItem) {
    item.onAction?.();
    removeToast(item.id, false);
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {toasts.map((item) => (
          <div
            key={item.id}
            className="toast-pop pointer-events-auto relative flex w-full max-w-sm items-center gap-3 overflow-hidden rounded-xl bg-slate-900 px-4 py-3 text-[13px] font-medium text-white shadow-lg"
          >
            <span className="flex-1">{item.message}</span>
            {item.actionLabel && (
              <button
                onClick={() => handleAction(item)}
                className="shrink-0 rounded-lg bg-white/15 px-2.5 py-1 text-[12px] font-semibold hover:bg-white/25"
              >
                {item.actionLabel}
              </button>
            )}
            {item.actionLabel && (
              <span
                className="toast-progress absolute inset-x-0 bottom-0 h-0.5 bg-amber-400"
                style={{ animationDuration: `${item.duration}ms` }}
              />
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast ToastProvider ichida ishlatilishi kerak");
  return ctx;
}

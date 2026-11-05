"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info";
type Toast = { id: number; message: string; tone: ToastTone };

const ToastContext = createContext<{ toast: (message: string, tone?: ToastTone) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((current) => [...current.slice(-3), { id, message, tone }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed bottom-5 right-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "animate-toast-in pointer-events-auto flex items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-float",
              t.tone === "success" && "border-forest/20 bg-forest text-night",
              t.tone === "error" && "border-rust/30 bg-surface text-rust",
              t.tone === "info" && "border-line bg-surface text-ink",
            )}
          >
            {t.tone === "success" ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            ) : t.tone === "error" ? (
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
            ) : (
              <Info className="mt-0.5 size-4 shrink-0" />
            )}
            <p className="flex-1 leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
              className="opacity-60 transition hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastItem {
  id: number;
  message: string;
  visible: boolean;
}

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, message, visible: false }]);
    // Flip to visible on the next frame so the enter transition actually plays.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setToasts((t) => t.map((toast) => (toast.id === id ? { ...toast, visible: true } : toast)));
      });
    });
    setTimeout(() => {
      setToasts((t) => t.map((toast) => (toast.id === id ? { ...toast, visible: false } : toast)));
      setTimeout(() => setToasts((t) => t.filter((toast) => toast.id !== id)), 300);
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-all duration-300 ${
              toast.visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

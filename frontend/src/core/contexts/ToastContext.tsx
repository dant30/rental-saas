import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";

type Toast = { id: number; message: string; tone?: "info" | "success" | "warning" | "danger" };

interface ToastContextValue {
  toasts: Toast[];
  pushToast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idCounter = useRef(0);

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((message: string, tone: Toast["tone"] = "info") => {
    idCounter.current += 1;
    setToasts((current) => [...current, { id: idCounter.current, message, tone }]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      pushToast,
      dismissToast,
    }),
    [dismissToast, pushToast, toasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: "fixed", right: 16, bottom: 16, display: "grid", gap: 12, zIndex: 30 }}>
        {toasts.map((toast) => (
          <button
            className={`status-badge${toast.tone ? ` status-badge--${toast.tone === "info" ? "success" : toast.tone}` : ""}`}
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            type="button"
          >
            {toast.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
};

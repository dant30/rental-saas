import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type Toast = { id: number; message: string; tone?: "info" | "success" | "warning" | "danger" };

interface ToastContextValue {
  toasts: Toast[];
  pushToast: (message: string, tone?: Toast["tone"]) => void;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      pushToast: (message, tone = "info") =>
        setToasts((current) => [...current, { id: Date.now(), message, tone }]),
      dismissToast: (id) => setToasts((current) => current.filter((toast) => toast.id !== id)),
    }),
    [toasts],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: "fixed", right: 16, bottom: 16, display: "grid", gap: 12, zIndex: 30 }}>
        {toasts.map((toast) => (
          <button
            className={`status-badge${toast.tone ? ` status-badge--${toast.tone === "info" ? "success" : toast.tone}` : ""}`}
            key={toast.id}
            onClick={() => value.dismissToast(toast.id)}
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

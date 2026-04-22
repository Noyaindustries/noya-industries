"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DashboardToast = { id: string; message: string };

type DashboardUiValue = {
  globalSearch: string;
  setGlobalSearch: (value: string) => void;
  toasts: DashboardToast[];
  pushToast: (message: string) => void;
  dismissToast: (id: string) => void;
};

const DashboardUiContext = createContext<DashboardUiValue | null>(null);

export function useDashboardUi(): DashboardUiValue {
  const ctx = useContext(DashboardUiContext);
  if (!ctx) {
    throw new Error("useDashboardUi doit être utilisé dans DashboardUiProvider");
  }
  return ctx;
}

export function DashboardUiProvider({ children }: { children: ReactNode }) {
  const [globalSearch, setGlobalSearch] = useState("");
  const [toasts, setToasts] = useState<DashboardToast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback((message: string) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `t-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(
    () => ({
      globalSearch,
      setGlobalSearch,
      toasts,
      pushToast,
      dismissToast,
    }),
    [globalSearch, toasts, pushToast, dismissToast],
  );

  return (
    <DashboardUiContext.Provider value={value}>
      {children}
      <div className="db-toast-stack" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="db-toast" role="status">
            <span className="db-toast-msg">{t.message}</span>
            <button
              type="button"
              className="db-toast-close"
              aria-label="Fermer la notification"
              onClick={() => dismissToast(t.id)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </DashboardUiContext.Provider>
  );
}

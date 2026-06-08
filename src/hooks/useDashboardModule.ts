"use client";

import { useCallback, useEffect, useState } from "react";

export function useDashboardModule<T>(endpoint: string, active: boolean) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoint, { cache: "no-store" });
      const json = (await response.json()) as T & { error?: string };
      if (!response.ok) {
        setError(json.error ?? "Chargement impossible.");
        return;
      }
      setData(json);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (active) void reload();
  }, [active, reload]);

  return { data, loading, error, reload };
}

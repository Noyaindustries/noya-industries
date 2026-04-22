const KEY = "noya-infinite-core-dashboard-sections";

export type StoredDashboardSections = Record<string, string>;

export function readDashboardSections(): StoredDashboardSections {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as StoredDashboardSections)
      : {};
  } catch {
    return {};
  }
}

export function writeDashboardSections(data: StoredDashboardSections): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* quota / private mode */
  }
}

export function resolveStoredSection<T extends string>(
  key: string,
  fallback: T,
  allowed: readonly T[],
): T {
  if (typeof window === "undefined") return fallback;
  const v = readDashboardSections()[key];
  if (v && (allowed as readonly string[]).includes(v)) {
    return v as T;
  }
  return fallback;
}

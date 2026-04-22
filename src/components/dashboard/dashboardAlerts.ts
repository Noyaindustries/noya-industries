import type { ReactNode } from "react";

export type DashboardAlert = {
  id: string;
  kind: "warn" | "err" | "info" | "suc";
  icon: string;
  content: ReactNode;
};

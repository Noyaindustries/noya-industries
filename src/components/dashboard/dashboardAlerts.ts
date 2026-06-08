import type { OverviewAlertDto } from "@/lib/dashboard/overview-data";
import { createElement, Fragment, type ReactNode } from "react";

export type DashboardAlert = {
  id: string;
  kind: "warn" | "err" | "info" | "suc";
  icon: string;
  content: ReactNode;
};

export function mapOverviewAlerts(dtos: OverviewAlertDto[]): DashboardAlert[] {
  return dtos.map((alert) => ({
    id: alert.id,
    kind: alert.kind,
    icon: alert.icon,
    content: createElement(
      Fragment,
      null,
      createElement("strong", null, alert.title),
      ` — ${alert.detail}`,
    ),
  }));
}

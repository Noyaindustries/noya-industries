import type { Metadata } from "next";
import "./dashboard.css";

export const metadata: Metadata = {
  title: "Noya Industries — Dashboard",
  description: "Tableau de bord Infinite Core — Noya Industries.",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="dashboard-root">{children}</div>;
}

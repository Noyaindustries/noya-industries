export type FinanceSectionId =
  | "overview"
  | "invoices"
  | "treasury"
  | "reports";

export const FINANCE_NAV: { id: FinanceSectionId; label: string }[] = [
  { id: "overview", label: "Synthèse" },
  { id: "invoices", label: "Facturation" },
  { id: "treasury", label: "Trésorerie" },
  { id: "reports", label: "Rapports" },
];

export const FINANCE_SECTION_LABELS: Record<FinanceSectionId, string> = {
  overview: "Synthèse",
  invoices: "Facturation",
  treasury: "Trésorerie",
  reports: "Rapports",
};

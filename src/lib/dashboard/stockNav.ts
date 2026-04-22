export type StockSectionId =
  | "overview"
  | "catalog"
  | "orders"
  | "alerts";

export const STOCK_NAV: { id: StockSectionId; label: string }[] = [
  { id: "overview", label: "Synthèse" },
  { id: "catalog", label: "Catalogue" },
  { id: "orders", label: "Commandes" },
  { id: "alerts", label: "Alertes" },
];

export const STOCK_SECTION_LABELS: Record<StockSectionId, string> = {
  overview: "Synthèse",
  catalog: "Catalogue",
  orders: "Commandes",
  alerts: "Alertes",
};

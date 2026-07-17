"use client";

import type { StockSectionId } from "@/lib/dashboard/stockNav";
import { formatFcfa } from "@/lib/dashboard/module-fallbacks";
import { matchesSearch } from "@/lib/dashboard/textSearch";
import { useDashboardModule } from "@/hooks/useDashboardModule";
import { useDashboardUi } from "../dashboardUiContext";
import { useMemo, useState } from "react";

type StockPageProps = {
  active: boolean;
  section: StockSectionId;
  onStockNavigate?: (s: StockSectionId) => void;
};

type StockApiItem = {
  ref: string;
  label: string;
  category: string;
  quantity: number;
  price: number;
  minQuantity: number;
};

const EMPTY_STOCK_ITEMS: StockApiItem[] = [];

export function StockPage({ active, section, onStockNavigate }: StockPageProps) {
  const { globalSearch, pushToast } = useDashboardUi();
  const [catalogQuery, setCatalogQuery] = useState("");
  const { data, reload } = useDashboardModule<{ items: StockApiItem[] }>(
    "/api/dashboard/stock",
    active,
  );

  const items = data?.items ?? EMPTY_STOCK_ITEMS;
  const lowStock = items.filter((i) => i.quantity <= i.minQuantity);

  const filteredCatalog = useMemo(
    () =>
      items.filter(
        (r) =>
          matchesSearch(
            [r.ref, r.label, r.category, String(r.quantity), formatFcfa(r.price)],
            section === "catalog" ? catalogQuery : "",
          ) && matchesSearch([r.ref, r.label, r.category], globalSearch),
      ),
    [items, section, catalogQuery, globalSearch],
  );

  const totalValue = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  async function addItem() {
    const ref = window.prompt("Référence article (ex: NK-XXX) ?");
    if (!ref?.trim()) return;
    const label = window.prompt("Libellé ?");
    if (!label?.trim()) return;
    const response = await fetch("/api/dashboard/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: ref.trim(), label: label.trim(), quantity: 0, price: 0 }),
    });
    if (!response.ok) {
      pushToast("Impossible d'ajouter l'article.");
      return;
    }
    pushToast("Article ajouté au catalogue.");
    void reload();
  }

  return (
    <div className={`page${active ? " active" : ""}`} id="page-stock">
      <div className="kpi-row">
        <div className="kpi gold">
          <div className="kpi-label">Articles en stock</div>
          <div className="kpi-val">{items.length}</div>
          <div className="kpi-delta neutral">● Catalogue actif</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-label">Valeur stock</div>
          <div className="kpi-val">{Math.round(totalValue / 1000)}K</div>
          <div className="kpi-delta up">▲ FCFA</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-label">Unités totales</div>
          <div className="kpi-val">{items.reduce((s, i) => s + i.quantity, 0)}</div>
          <div className="kpi-delta neutral">● En entrepôt</div>
        </div>
        <div className="kpi green">
          <div className="kpi-label">Alertes stock bas</div>
          <div className="kpi-val">{lowStock.length}</div>
          <div className="kpi-delta down">▼ Réappro.</div>
        </div>
      </div>

      {section === "overview" ? (
        <div className="grid-2">
          <button type="button" className="fin-report-tile" onClick={() => onStockNavigate?.("catalog")}>
            <span className="fin-report-ico">📦</span>
            <span className="fin-report-t">Catalogue</span>
            <span className="fin-report-d">{items.length} références</span>
          </button>
          <button type="button" className="fin-report-tile" onClick={() => onStockNavigate?.("alerts")}>
            <span className="fin-report-ico">⚠️</span>
            <span className="fin-report-t">Alertes</span>
            <span className="fin-report-d">{lowStock.length} articles sous seuil</span>
          </button>
        </div>
      ) : null}

      {(section === "catalog" || section === "orders") && (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">📦 {section === "catalog" ? "Catalogue" : "Commandes"}</div>
              <div className="card-sub">Gestion des articles Noya</div>
            </div>
            <div className="card-actions">
              {section === "catalog" ? (
                <input
                  type="search"
                  className="fin-invoice-search"
                  placeholder="Rechercher…"
                  value={catalogQuery}
                  onChange={(e) => setCatalogQuery(e.target.value)}
                />
              ) : null}
              <button type="button" className="ca-btn primary" onClick={() => void addItem()}>
                ＋ Article
              </button>
            </div>
          </div>
          <div className="card-table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Réf.</th>
                  <th>Libellé</th>
                  <th>Catégorie</th>
                  <th>Qté</th>
                  <th>Prix unit.</th>
                </tr>
              </thead>
              <tbody>
                {filteredCatalog.map((row) => (
                  <tr key={row.ref}>
                    <td className="bold">{row.ref}</td>
                    <td>{row.label}</td>
                    <td>{row.category}</td>
                    <td>{row.quantity}</td>
                    <td>{formatFcfa(row.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === "alerts" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">⚠️ Alertes stock bas</div>
              <div className="card-sub">Articles à réapprovisionner</div>
            </div>
          </div>
          <div className="card-table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Réf.</th>
                  <th>Article</th>
                  <th>Stock</th>
                  <th>Seuil min.</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.length === 0 ? (
                  <tr>
                    <td colSpan={4}>Aucune alerte — stocks OK.</td>
                  </tr>
                ) : (
                  lowStock.map((row) => (
                    <tr key={row.ref}>
                      <td className="bold">{row.ref}</td>
                      <td>{row.label}</td>
                      <td>
                        <span className="badge r">{row.quantity}</span>
                      </td>
                      <td>{row.minQuantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

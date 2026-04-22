"use client";

import type { FinanceSectionId } from "@/lib/dashboard/financeNav";
import { matchesSearch } from "@/lib/dashboard/textSearch";
import { drawFinChart } from "@/lib/dashboard/chartDrawers";
import { downloadCsv } from "@/lib/dashboard/downloadCsv";
import { useDashboardUi } from "../dashboardUiContext";
import { useEffect, useMemo, useRef, useState } from "react";

type FinancePageProps = {
  active: boolean;
  section: FinanceSectionId;
  onFinanceNavigate?: (s: FinanceSectionId) => void;
};

type InvoiceRow = {
  num: string;
  client: string;
  mission: string;
  date: string;
  due: string;
  amount: string;
  amountTone: "gold" | "red";
  status: "payé" | "retard" | "attente" | "partiel";
};
type InvoiceStatusFilter = "all" | InvoiceRow["status"];

const INVOICES: InvoiceRow[] = [
  {
    num: "F-2026-052",
    client: "Sté Coulibaly",
    mission: "Audit Business",
    date: "02 Avr",
    due: "17 Avr",
    amount: "280 000",
    amountTone: "gold",
    status: "payé",
  },
  {
    num: "F-2026-051",
    client: "Kofi & Frères",
    mission: "Audit Rapide",
    date: "01 Avr",
    due: "16 Avr",
    amount: "150 000",
    amountTone: "gold",
    status: "payé",
  },
  {
    num: "F-2026-047",
    client: "Cabinet Diomandé",
    mission: "PRESENZ PRO",
    date: "28 Mar",
    due: "07 Avr",
    amount: "450 000",
    amountTone: "red",
    status: "retard",
  },
  {
    num: "F-2026-049",
    client: "Marc Touré",
    mission: "Formation",
    date: "30 Mar",
    due: "14 Avr",
    amount: "75 000",
    amountTone: "gold",
    status: "attente",
  },
  {
    num: "F-2026-050",
    client: "Groupe Ouattara",
    mission: "Community",
    date: "01 Avr",
    due: "15 Avr",
    amount: "120 000",
    amountTone: "gold",
    status: "attente",
  },
  {
    num: "F-2026-045",
    client: "LONACI",
    mission: "Audit Institutionnel",
    date: "25 Mar",
    due: "24 Avr",
    amount: "1 200 000",
    amountTone: "gold",
    status: "partiel",
  },
];

function invoiceStatusText(s: InvoiceRow["status"]): string {
  if (s === "payé") return "Payé";
  if (s === "retard") return "En retard";
  if (s === "attente") return "En attente";
  return "Partiel";
}

function invoiceStatusFilterLabel(s: InvoiceStatusFilter): string {
  if (s === "all") return "Tous statuts";
  if (s === "payé") return "Payé";
  if (s === "retard") return "En retard";
  if (s === "attente") return "En attente";
  return "Partiel";
}

function statusBadge(s: InvoiceRow["status"]) {
  if (s === "payé") return <span className="badge g">Payé</span>;
  if (s === "retard") return <span className="badge r">En retard</span>;
  if (s === "attente") return <span className="badge y">En attente</span>;
  return <span className="badge b">Partiel</span>;
}

function filterInvoiceRows(rows: InvoiceRow[], localQ: string, globalQ: string) {
  return rows.filter(
    (r) =>
      matchesSearch(
        [
          r.num,
          r.client,
          r.mission,
          r.amount,
          r.date,
          r.due,
          invoiceStatusText(r.status),
        ],
        localQ,
      ) &&
      matchesSearch(
        [
          r.num,
          r.client,
          r.mission,
          r.amount,
          r.date,
          r.due,
          invoiceStatusText(r.status),
        ],
        globalQ,
      ),
  );
}

function InvoiceTable({ rows }: { rows: InvoiceRow[] }) {
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>N° Facture</th>
          <th>Client</th>
          <th>Mission</th>
          <th>Date</th>
          <th>Échéance</th>
          <th>Montant</th>
          <th>Statut</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.num}>
            <td
              className="bold"
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: 11,
              }}
            >
              {row.num}
            </td>
            <td>{row.client}</td>
            <td>{row.mission}</td>
            <td>{row.date}</td>
            <td>{row.due}</td>
            <td
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: 12,
                color:
                  row.amountTone === "red" ? "var(--red)" : "var(--gold)",
              }}
            >
              {row.amount}
            </td>
            <td>{statusBadge(row.status)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ChargesBlock() {
  return (
    <div className="prog-row">
      <div className="prog-item">
        <div className="prog-top">
          <div className="prog-name">Salaires & Prestataires</div>
          <div className="prog-pct">52%</div>
        </div>
        <div className="prog-bar">
          <div
            className="prog-fill"
            style={{ width: "52%", background: "var(--gold)" }}
          />
        </div>
      </div>
      <div className="prog-item">
        <div className="prog-top">
          <div className="prog-name">Outils & Logiciels</div>
          <div className="prog-pct">18%</div>
        </div>
        <div className="prog-bar">
          <div
            className="prog-fill"
            style={{ width: "18%", background: "var(--cobalt2)" }}
          />
        </div>
      </div>
      <div className="prog-item">
        <div className="prog-top">
          <div className="prog-name">Marketing & Com.</div>
          <div className="prog-pct">15%</div>
        </div>
        <div className="prog-bar">
          <div
            className="prog-fill"
            style={{ width: "15%", background: "var(--green)" }}
          />
        </div>
      </div>
      <div className="prog-item">
        <div className="prog-top">
          <div className="prog-name">Hébergement & Infra</div>
          <div className="prog-pct">9%</div>
        </div>
        <div className="prog-bar">
          <div
            className="prog-fill"
            style={{ width: "9%", background: "var(--purple)" }}
          />
        </div>
      </div>
      <div className="prog-item">
        <div className="prog-top">
          <div className="prog-name">Divers & Imprévus</div>
          <div className="prog-pct">6%</div>
        </div>
        <div className="prog-bar">
          <div
            className="prog-fill"
            style={{ width: "6%", background: "var(--fog)" }}
          />
        </div>
      </div>
    </div>
  );
}

export function FinancePage({
  active,
  section,
  onFinanceNavigate,
}: FinancePageProps) {
  const { globalSearch, pushToast } = useDashboardUi();
  const [invoiceQuery, setInvoiceQuery] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] =
    useState<InvoiceStatusFilter>("all");
  const finRef = useRef<HTMLCanvasElement>(null);

  const filteredInvoices = useMemo(
    () => {
      const bySearch = filterInvoiceRows(
        INVOICES,
        section === "invoices" ? invoiceQuery : "",
        globalSearch,
      );
      if (invoiceStatusFilter === "all") return bySearch;
      return bySearch.filter((row) => row.status === invoiceStatusFilter);
    },
    [section, invoiceQuery, globalSearch, invoiceStatusFilter],
  );

  const cycleInvoiceStatusFilter = () => {
    const order: InvoiceStatusFilter[] = [
      "all",
      "payé",
      "attente",
      "retard",
      "partiel",
    ];
    const idx = order.indexOf(invoiceStatusFilter);
    setInvoiceStatusFilter(order[(idx + 1) % order.length]);
  };

  useEffect(() => {
    if (!active || section !== "overview") return;
    const t = window.setTimeout(() => drawFinChart(finRef.current), 100);
    const onResize = () => drawFinChart(finRef.current);
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [active, section]);

  return (
    <div className={`page${active ? " active" : ""}`} id="page-finance">
      <div className="kpi-row">
        <div className="kpi gold">
          <div className="kpi-label">Total Revenus — 2026</div>
          <div className="kpi-val">12.4M</div>
          <div className="kpi-delta up">▲ +24% vs 2025</div>
        </div>
        <div className="kpi green">
          <div className="kpi-label">Encaissé ce mois</div>
          <div className="kpi-val">1.8M</div>
          <div className="kpi-delta up">▲ +18%</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-label">En attente</div>
          <div className="kpi-val">680K</div>
          <div className="kpi-delta neutral">● 7 factures</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-label">Charges ce mois</div>
          <div className="kpi-val">420K</div>
          <div className="kpi-delta down">▲ +8%</div>
        </div>
      </div>

      {section === "overview" ? (
        <>
          <div className="grid-2">
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">📊 Évolution financière</div>
                  <div className="card-sub">Revenus vs charges — 6 mois</div>
                </div>
              </div>
              <div className="card-body">
                <div className="chart-wrap">
                  <canvas ref={finRef} id="financeChart" />
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">📂 Charges par catégorie</div>
                </div>
              </div>
              <div className="card-body">
                <ChargesBlock />
              </div>
            </div>
          </div>
          <div className="card fin-overview-follow">
            <div className="card-head">
              <div>
                <div className="card-title">⏱ Factures à suivre</div>
                <div className="card-sub">
                  Prochaines échéances & impayés signalés
                </div>
              </div>
              <div className="card-actions">
                <button
                  type="button"
                  className="ca-btn"
                  onClick={() => onFinanceNavigate?.("invoices")}
                >
                  Voir facturation
                </button>
              </div>
            </div>
            <div className="card-table-wrap">
              <InvoiceTable rows={filteredInvoices.slice(0, 4)} />
            </div>
          </div>
        </>
      ) : null}

      {section === "invoices" ? (
        <div className="card fin-invoices-card">
          <div className="card-head">
            <div>
              <div className="card-title">🧾 Factures & Paiements</div>
              <div className="card-sub">Avril 2026 · FCFA</div>
            </div>
            <div className="card-actions fin-invoice-toolbar">
              <input
                type="search"
                className="fin-invoice-search"
                placeholder="Rechercher client, N°…"
                aria-label="Filtrer les factures"
                value={invoiceQuery}
                onChange={(e) => setInvoiceQuery(e.target.value)}
              />
              <button
                type="button"
                className="ca-btn"
                onClick={cycleInvoiceStatusFilter}
              >
                {invoiceStatusFilterLabel(invoiceStatusFilter)}
              </button>
              <button
                type="button"
                className="ca-btn"
                onClick={() => {
                  downloadCsv(
                    "finance-factures.csv",
                    [
                      "Numero",
                      "Client",
                      "Mission",
                      "Date",
                      "Echeance",
                      "Montant FCFA",
                      "Statut",
                    ],
                    filteredInvoices.map((row) => [
                      row.num,
                      row.client,
                      row.mission,
                      row.date,
                      row.due,
                      row.amount,
                      invoiceStatusText(row.status),
                    ]),
                  );
                  pushToast("Export CSV des factures telecharge");
                }}
              >
                Export CSV
              </button>
              <button
                type="button"
                className="ca-btn primary"
                onClick={() =>
                  pushToast("Nouvelle facture (démo) — formulaire à brancher")
                }
              >
                ＋ Nouvelle facture
              </button>
            </div>
          </div>
          <div className="card-table-wrap">
            <InvoiceTable rows={filteredInvoices} />
          </div>
        </div>
      ) : null}

      {section === "treasury" ? (
        <>
          <div className="grid-3 fin-treasury-kpis">
            <div className="card fin-treasury-tile">
              <div className="card-head">
                <div>
                  <div className="card-title">🏦 Soldes bancaires</div>
                  <div className="card-sub">Consolidé · 3 comptes</div>
                </div>
              </div>
              <div className="card-body">
                <div className="fin-treasury-val">4,82M</div>
                <div className="fin-treasury-hint">FCFA disponibles</div>
              </div>
            </div>
            <div className="card fin-treasury-tile">
              <div className="card-head">
                <div>
                  <div className="card-title">📥 Encours clients</div>
                  <div className="card-sub">Factures émises non soldées</div>
                </div>
              </div>
              <div className="card-body">
                <div className="fin-treasury-val fin-treasury-warn">680K</div>
                <div className="fin-treasury-hint">7 factures · dont 1 retard</div>
              </div>
            </div>
            <div className="card fin-treasury-tile">
              <div className="card-head">
                <div>
                  <div className="card-title">📤 Sorties prévues</div>
                  <div className="card-sub">30 prochains jours</div>
                </div>
              </div>
              <div className="card-body">
                <div className="fin-treasury-val">1,05M</div>
                <div className="fin-treasury-hint">Charges & échéances fournisseurs</div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">📅 Jalons trésorerie</div>
                <div className="card-sub">Synthèse indicative</div>
              </div>
            </div>
            <div className="card-body fin-treasury-list">
              <ul>
                <li>
                  <strong>18 avr.</strong> — Échéance fournisseur cloud (120K)
                </li>
                <li>
                  <strong>22 avr.</strong> — Prévision encaissement LONACI (600K)
                </li>
                <li>
                  <strong>28 avr.</strong> — Paie & honoraires externes (~420K)
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : null}

      {section === "reports" ? (
        <div className="card fin-reports-card">
          <div className="card-head">
            <div>
              <div className="card-title">📑 Rapports & exports</div>
              <div className="card-sub">
                Grand livre, balance, TVA — formats PDF / Excel
              </div>
            </div>
          </div>
          <div className="card-body">
            <div className="fin-report-grid">
              <button type="button" className="fin-report-tile">
                <span className="fin-report-ico">📒</span>
                <span className="fin-report-t">Grand livre</span>
                <span className="fin-report-d">Exercice 2026 · PDF</span>
              </button>
              <button type="button" className="fin-report-tile">
                <span className="fin-report-ico">⚖️</span>
                <span className="fin-report-t">Balance générale</span>
                <span className="fin-report-d">Clôture mensuelle</span>
              </button>
              <button type="button" className="fin-report-tile">
                <span className="fin-report-ico">🧮</span>
                <span className="fin-report-t">Déclaration TVA</span>
                <span className="fin-report-d">T1 2026 · brouillon</span>
              </button>
              <button type="button" className="fin-report-tile">
                <span className="fin-report-ico">📊</span>
                <span className="fin-report-t">États de synthèse</span>
                <span className="fin-report-d">Direction & banques</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

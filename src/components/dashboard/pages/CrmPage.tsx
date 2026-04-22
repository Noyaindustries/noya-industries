"use client";

import type { CrmSectionId } from "@/lib/dashboard/crmNav";
import { downloadCsv } from "@/lib/dashboard/downloadCsv";
import { matchesSearch } from "@/lib/dashboard/textSearch";
import { useDashboardUi } from "../dashboardUiContext";
import { useMemo, useState } from "react";

type CrmPageProps = {
  active: boolean;
  section: CrmSectionId;
  onCrmNavigate?: (s: CrmSectionId) => void;
};

type ClientRow = {
  initials: string;
  name: string;
  sector: string;
  pole: "consulting" | "tech";
  value: string;
  contact: string;
  status: "actif" | "relance" | "retard";
  avBg: string;
  avColor?: string;
};

const CLIENTS: ClientRow[] = [
  {
    initials: "KF",
    name: "Kofi & Frères",
    sector: "Commerce",
    pole: "consulting",
    value: "430 000",
    contact: "02 Avr",
    status: "actif",
    avBg: "var(--gold)",
    avColor: "#000",
  },
  {
    initials: "SC",
    name: "Sté Coulibaly",
    sector: "Industrie",
    pole: "consulting",
    value: "280 000",
    contact: "04 Avr",
    status: "actif",
    avBg: "var(--cobalt2)",
  },
  {
    initials: "CD",
    name: "Cabinet Diomandé",
    sector: "Conseil",
    pole: "tech",
    value: "950 000",
    contact: "01 Avr",
    status: "relance",
    avBg: "var(--green)",
  },
  {
    initials: "GO",
    name: "Groupe Ouattara",
    sector: "BTP",
    pole: "consulting",
    value: "120 000",
    contact: "30 Mar",
    status: "retard",
    avBg: "var(--purple)",
  },
  {
    initials: "LO",
    name: "LONACI",
    sector: "Institution",
    pole: "consulting",
    value: "2 400 000",
    contact: "03 Avr",
    status: "actif",
    avBg: "#F59E0B",
  },
];

function statusBadge(s: ClientRow["status"]) {
  if (s === "actif") return <span className="badge g">Actif</span>;
  if (s === "relance") return <span className="badge y">Relance</span>;
  return <span className="badge r">Retard</span>;
}

function poleBadge(p: ClientRow["pole"]) {
  if (p === "tech") return <span className="badge p">Tech</span>;
  return <span className="badge b">Consulting</span>;
}

function clientStatusText(s: ClientRow["status"]): string {
  if (s === "actif") return "Actif";
  if (s === "relance") return "Relance";
  return "Retard";
}

function clientPoleText(p: ClientRow["pole"]): string {
  return p === "tech" ? "Tech" : "Consulting";
}

function ClientsTable({
  rows,
  showToolbar,
  filterQuery,
  onFilterQueryChange,
  sectorFilterLabel,
  onSectorFilterClick,
  onExportClick,
}: {
  rows: ClientRow[];
  showToolbar?: boolean;
  filterQuery?: string;
  onFilterQueryChange?: (value: string) => void;
  sectorFilterLabel?: string;
  onSectorFilterClick?: () => void;
  onExportClick?: () => void;
}) {
  const { pushToast } = useDashboardUi();
  return (
    <>
      {showToolbar ? (
        <div className="card-head crm-accounts-toolbar-wrap">
          <div>
            <div className="card-title">👥 Répertoire clients</div>
            <div className="card-sub">Portefeuille · FCFA</div>
          </div>
          <div className="card-actions fin-invoice-toolbar">
            <input
              type="search"
              className="fin-invoice-search"
              placeholder="Client, secteur, pôle…"
              aria-label="Filtrer les comptes"
              value={filterQuery ?? ""}
              onChange={(e) => onFilterQueryChange?.(e.target.value)}
            />
            <button
              type="button"
              className="ca-btn"
              onClick={onSectorFilterClick}
            >
              {sectorFilterLabel ?? "Tous secteurs"}
            </button>
            <button type="button" className="ca-btn" onClick={onExportClick}>
              Export CSV
            </button>
            <button
              type="button"
              className="ca-btn primary"
              onClick={() =>
                pushToast("Nouveau compte (démo) — formulaire à brancher")
              }
            >
              ＋ Ajouter
            </button>
          </div>
        </div>
      ) : null}
      <div className="card-table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Client</th>
              <th>Secteur</th>
              <th>Pôle</th>
              <th>Valeur totale</th>
              <th>Dernier contact</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td className="bold">
                  <span
                    className="av"
                    style={{
                      background: row.avBg,
                      ...(row.avColor ? { color: row.avColor } : {}),
                    }}
                  >
                    {row.initials}
                  </span>
                  {row.name}
                </td>
                <td>{row.sector}</td>
                <td>{poleBadge(row.pole)}</td>
                <td
                  style={{
                    fontFamily: "var(--font-dm-mono), monospace",
                    fontSize: 11,
                    color: "var(--gold)",
                  }}
                >
                  {row.value}
                </td>
                <td
                  style={{
                    fontFamily: "var(--font-dm-mono), monospace",
                    fontSize: 10.5,
                    color: "var(--fog)",
                  }}
                >
                  {row.contact}
                </td>
                <td>{statusBadge(row.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function PipelineBoard() {
  return (
    <div className="pipeline">
      <div className="pipe-col">
        <div className="pipe-head">
          Prospect <span className="pipe-count">4</span>
        </div>
        <div className="pipe-card">
          <div className="pipe-cname">Sté Tech Abidjan</div>
          <div className="pipe-cval">—</div>
          <div className="pipe-csub">Infinite Core · Contact initial</div>
        </div>
        <div className="pipe-card">
          <div className="pipe-cname">ONG Espoir CI</div>
          <div className="pipe-cval">—</div>
          <div className="pipe-csub">Formation · Intérêt reçu</div>
        </div>
        <div className="pipe-card">
          <div className="pipe-cname">Dr. Sékou Bah</div>
          <div className="pipe-cval">—</div>
          <div className="pipe-csub">PRESENZ · Lead entrant</div>
        </div>
        <div className="pipe-card">
          <div className="pipe-cname">Banque Atlantique</div>
          <div className="pipe-cval">—</div>
          <div className="pipe-csub">Audit · Recommandation</div>
        </div>
      </div>
      <div className="pipe-col">
        <div className="pipe-head">
          Qualification <span className="pipe-count">3</span>
        </div>
        <div
          className="pipe-card"
          style={{ borderColor: "var(--gold-border)" }}
        >
          <div className="pipe-cname">Awa Koné</div>
          <div className="pipe-cval">320 000 FCFA</div>
          <div className="pipe-csub">Infinite Core · RDV fait</div>
        </div>
        <div
          className="pipe-card"
          style={{ borderColor: "var(--gold-border)" }}
        >
          <div className="pipe-cname">Import-Export Kacou</div>
          <div className="pipe-cval">180 000 FCFA</div>
          <div className="pipe-csub">Audit Rapide · Besoin validé</div>
        </div>
        <div
          className="pipe-card"
          style={{ borderColor: "var(--gold-border)" }}
        >
          <div className="pipe-cname">École Privée Riviera</div>
          <div className="pipe-cval">95 000 FCFA</div>
          <div className="pipe-csub">PRESENZ One-Page</div>
        </div>
      </div>
      <div className="pipe-col">
        <div className="pipe-head">
          Proposition <span className="pipe-count">3</span>
        </div>
        <div
          className="pipe-card"
          style={{ borderColor: "var(--cobalt-border)" }}
        >
          <div className="pipe-cname">Clinique Santé Plus</div>
          <div className="pipe-cval">650 000 FCFA</div>
          <div className="pipe-csub">Infinite Core · Devis envoyé</div>
        </div>
        <div
          className="pipe-card"
          style={{ borderColor: "var(--cobalt-border)" }}
        >
          <div className="pipe-cname">Mairie de Yopougon</div>
          <div className="pipe-cval">1 200 000 FCFA</div>
          <div className="pipe-csub">Audit Institutionnel</div>
        </div>
        <div
          className="pipe-card"
          style={{ borderColor: "var(--cobalt-border)" }}
        >
          <div className="pipe-cname">Groupe Amangoua</div>
          <div className="pipe-cval">480 000 FCFA</div>
          <div className="pipe-csub">Community + PRESENZ PRO</div>
        </div>
      </div>
      <div className="pipe-col">
        <div className="pipe-head">
          Négociation <span className="pipe-count">2</span>
        </div>
        <div
          className="pipe-card"
          style={{ borderColor: "var(--green-border)" }}
        >
          <div className="pipe-cname">LONACI (extension)</div>
          <div className="pipe-cval">800 000 FCFA</div>
          <div className="pipe-csub">Phase 2 · Contrat en relecture</div>
        </div>
        <div
          className="pipe-card"
          style={{ borderColor: "var(--green-border)" }}
        >
          <div className="pipe-cname">Fondation Jeunesse</div>
          <div className="pipe-cval">350 000 FCFA</div>
          <div className="pipe-csub">Formation + Suivi</div>
        </div>
      </div>
      <div className="pipe-col">
        <div className="pipe-head" style={{ color: "#4ADE80" }}>
          Gagné ✓{" "}
          <span
            className="pipe-count"
            style={{ color: "#4ADE80", borderColor: "var(--green-border)" }}
          >
            12
          </span>
        </div>
        <div
          className="pipe-card"
          style={{
            borderColor: "var(--green-border)",
            background: "rgba(16,185,129,.05)",
          }}
        >
          <div className="pipe-cname">Sté Coulibaly</div>
          <div className="pipe-cval" style={{ color: "#4ADE80" }}>
            280 000 FCFA
          </div>
          <div className="pipe-csub">Audit Business · Payé</div>
        </div>
        <div
          className="pipe-card"
          style={{
            borderColor: "var(--green-border)",
            background: "rgba(16,185,129,.05)",
          }}
        >
          <div className="pipe-cname">Kofi & Frères</div>
          <div className="pipe-cval" style={{ color: "#4ADE80" }}>
            150 000 FCFA
          </div>
          <div className="pipe-csub">Audit Rapide · Payé</div>
        </div>
      </div>
    </div>
  );
}

function ActivitiesPanel() {
  return (
    <div className="grid-2 crm-activities-grid">
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">📬 Derniers échanges</div>
            <div className="card-sub">Appels, e-mails & notes</div>
          </div>
        </div>
        <div className="card-body">
          <div className="activity">
            <div className="act-item">
              <span className="act-dot" style={{ color: "var(--gold)" }} />
              <div className="act-text">
                <strong>LONACI</strong> — Compte-rendu négociation phase 2
                envoyé au CFO.
              </div>
              <div className="act-time">Auj. 09:40</div>
            </div>
            <div className="act-item">
              <span className="act-dot" style={{ color: "var(--cobalt2)" }} />
              <div className="act-text">
                <strong>Cabinet Diomandé</strong> — Relance facture F-2026-047
                (template juridique).
              </div>
              <div className="act-time">Hier</div>
            </div>
            <div className="act-item">
              <span className="act-dot" style={{ color: "var(--green)" }} />
              <div className="act-text">
                <strong>Sté Coulibaly</strong> — Paiement confirmé · Merci
                envoyé.
              </div>
              <div className="act-time">Hier</div>
            </div>
            <div className="act-item">
              <span className="act-dot" style={{ color: "var(--purple)" }} />
              <div className="act-text">
                <strong>Groupe Ouattara</strong> — Point hebdo Community ·
                action items 4.
              </div>
              <div className="act-time">02 Avr</div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">📅 RDV & tâches</div>
            <div className="card-sub">7 prochains jours</div>
          </div>
          <div className="card-actions">
            <button type="button" className="ca-btn primary">
              Planifier
            </button>
          </div>
        </div>
        <div className="card-body crm-rdv-list">
          <ul>
            <li>
              <span className="crm-rdv-date">15 avr.</span>
              <span className="crm-rdv-body">
                <strong>Mairie Yopougon</strong> — Présentation devis Audit
                Institutionnel
              </span>
            </li>
            <li>
              <span className="crm-rdv-date">16 avr.</span>
              <span className="crm-rdv-body">
                <strong>Clinique Santé Plus</strong> — Suivi proposition
                Infinite Core
              </span>
            </li>
            <li>
              <span className="crm-rdv-date">18 avr.</span>
              <span className="crm-rdv-body">
                <strong>ONG Espoir CI</strong> — Qualification besoin
                formation
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function filterClientRows(
  rows: ClientRow[],
  localQ: string,
  globalQ: string,
): ClientRow[] {
  return rows.filter((c) => {
    const parts = [
      c.name,
      c.sector,
      c.initials,
      c.value,
      c.contact,
      clientStatusText(c.status),
      clientPoleText(c.pole),
    ];
    return matchesSearch(parts, localQ) && matchesSearch(parts, globalQ);
  });
}

export function CrmPage({ active, section, onCrmNavigate }: CrmPageProps) {
  const { globalSearch, pushToast } = useDashboardUi();
  const [accountQuery, setAccountQuery] = useState("");
  const [accountSectorFilter, setAccountSectorFilter] = useState<string>("all");

  const sectorOrder = useMemo(() => {
    const sectors = Array.from(new Set(CLIENTS.map((c) => c.sector)));
    return ["all", ...sectors];
  }, []);

  const filteredClients = useMemo(
    () => {
      const bySearch = filterClientRows(
        CLIENTS,
        section === "accounts" ? accountQuery : "",
        globalSearch,
      );
      if (accountSectorFilter === "all") return bySearch;
      return bySearch.filter((row) => row.sector === accountSectorFilter);
    },
    [section, accountQuery, globalSearch, accountSectorFilter],
  );

  const cycleSectorFilter = () => {
    const idx = sectorOrder.indexOf(accountSectorFilter);
    setAccountSectorFilter(sectorOrder[(idx + 1) % sectorOrder.length] ?? "all");
  };

  return (
    <div className={`page${active ? " active" : ""}`} id="page-crm">
      <div className="kpi-row">
        <div className="kpi gold">
          <div className="kpi-label">Total clients</div>
          <div className="kpi-val">148</div>
          <div className="kpi-delta up">▲ +12 ce trimestre</div>
        </div>
        <div className="kpi green">
          <div className="kpi-label">Clients actifs</div>
          <div className="kpi-val">89</div>
          <div className="kpi-delta up">▲ 60% du portefeuille</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-label">Pipeline devis</div>
          <div className="kpi-val">2.1M</div>
          <div className="kpi-delta neutral">● 8 propositions</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-label">Taux conversion</div>
          <div className="kpi-val">68%</div>
          <div className="kpi-delta up">▲ +5 pts</div>
        </div>
      </div>

      {section === "overview" ? (
        <>
          <div className="grid-2">
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">📈 Pipeline — aperçu</div>
                  <div className="card-sub">Valeur & étapes clés</div>
                </div>
              </div>
              <div className="card-body">
                <div className="mini-grid crm-overview-mini">
                  <div className="mini-stat">
                    <div className="mini-val" style={{ color: "var(--gold)" }}>
                      2,1M
                    </div>
                    <div className="mini-lbl">Valeur pipeline</div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-val" style={{ color: "var(--cobalt3)" }}>
                      14
                    </div>
                    <div className="mini-lbl">Opportunités</div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-val" style={{ color: "var(--green)" }}>
                      68%
                    </div>
                    <div className="mini-lbl">Conversion</div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-val" style={{ color: "var(--purple)" }}>
                      5
                    </div>
                    <div className="mini-lbl">Relances</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">⚡ À prioriser</div>
                  <div className="card-sub">Actions commerciales</div>
                </div>
              </div>
              <div className="card-body crm-prio-body">
                <ul className="crm-prio-list">
                  <li>
                    Relancer <strong>Cabinet Diomandé</strong> — facture en retard
                    (+3 j.)
                  </li>
                  <li>Envoyer contrat <strong>LONACI</strong> — phase 2</li>
                  <li>Qualifier <strong>ONG Espoir CI</strong> — créneau formation</li>
                  <li>Revue devis <strong>Mairie Yopougon</strong> — marge cible</li>
                </ul>
                <div className="crm-prio-actions">
                  <button
                    type="button"
                    className="ca-btn"
                    onClick={() => onCrmNavigate?.("pipeline")}
                  >
                    Voir pipeline
                  </button>
                  <button
                    type="button"
                    className="ca-btn primary"
                    onClick={() => onCrmNavigate?.("activities")}
                  >
                    Activités
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="card crm-overview-accounts">
            <div className="card-head">
              <div>
                <div className="card-title">👥 Comptes suivis</div>
                <div className="card-sub">Aperçu du portefeuille</div>
              </div>
              <div className="card-actions">
                <button
                  type="button"
                  className="ca-btn primary"
                  onClick={() => onCrmNavigate?.("accounts")}
                >
                  Répertoire complet
                </button>
              </div>
            </div>
            <ClientsTable rows={filteredClients.slice(0, 4)} />
          </div>
        </>
      ) : null}

      {section === "pipeline" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">🔀 Pipeline commercial</div>
              <div className="card-sub">
                Opportunités par étape · FCFA
              </div>
            </div>
            <div className="card-actions">
              <button type="button" className="ca-btn primary">
                ＋ Opportunité
              </button>
            </div>
          </div>
          <PipelineBoard />
        </div>
      ) : null}

      {section === "accounts" ? (
        <div className="card crm-accounts-card">
          <ClientsTable
            rows={filteredClients}
            showToolbar
            filterQuery={accountQuery}
            onFilterQueryChange={setAccountQuery}
            sectorFilterLabel={
              accountSectorFilter === "all"
                ? "Tous secteurs"
                : accountSectorFilter
            }
            onSectorFilterClick={cycleSectorFilter}
            onExportClick={() => {
              downloadCsv(
                "crm-comptes.csv",
                [
                  "Client",
                  "Initiales",
                  "Secteur",
                  "Pole",
                  "Valeur FCFA",
                  "Dernier contact",
                  "Statut",
                ],
                filteredClients.map((row) => [
                  row.name,
                  row.initials,
                  row.sector,
                  clientPoleText(row.pole),
                  row.value,
                  row.contact,
                  clientStatusText(row.status),
                ]),
              );
              pushToast("Export CSV des comptes telecharge");
            }}
          />
        </div>
      ) : null}

      {section === "activities" ? <ActivitiesPanel /> : null}
    </div>
  );
}

"use client";

import type { ProjectsSectionId } from "@/lib/dashboard/projectsNav";
import { downloadCsv } from "@/lib/dashboard/downloadCsv";
import { matchesSearch } from "@/lib/dashboard/textSearch";
import { useDashboardUi } from "../dashboardUiContext";
import { useMemo, useState } from "react";

type ProjectsPageProps = {
  active: boolean;
  section: ProjectsSectionId;
  onProjectsNavigate?: (s: ProjectsSectionId) => void;
};

type ProjectRow = {
  name: string;
  client: string;
  owner: { initials: string; bg: string; color?: string };
  deadline: string;
  deadlineWarn?: boolean;
  pct: number;
  barColor: string;
  status: "en_cours" | "retard" | "avance" | "livre";
};
type ProjectStatusFilter = "all" | ProjectRow["status"];

const PROJECTS: ProjectRow[] = [
  {
    name: "PADDE-CI Audit #014",
    client: "LONACI",
    owner: { initials: "YN", bg: "var(--gold)", color: "#000" },
    deadline: "18 Avr",
    pct: 75,
    barColor: "var(--gold)",
    status: "en_cours",
  },
  {
    name: "PRESENZ PRO #012",
    client: "Grp. Ouattara",
    owner: { initials: "KS", bg: "var(--cobalt2)" },
    deadline: "05 Avr ⚠",
    deadlineWarn: true,
    pct: 52,
    barColor: "var(--red)",
    status: "retard",
  },
  {
    name: "Infinite Core Deploy",
    client: "Cabinet Diomandé",
    owner: { initials: "KS", bg: "var(--green)" },
    deadline: "22 Avr",
    pct: 85,
    barColor: "var(--green)",
    status: "avance",
  },
  {
    name: "Formation Mktg Digital",
    client: "École Riviera",
    owner: { initials: "JL", bg: "var(--purple)" },
    deadline: "25 Avr",
    pct: 30,
    barColor: "var(--purple)",
    status: "en_cours",
  },
  {
    name: "Community Koffi #008",
    client: "Kofi & Frères",
    owner: { initials: "JL", bg: "var(--gold2)", color: "#000" },
    deadline: "Mensuel",
    pct: 100,
    barColor: "var(--gold)",
    status: "livre",
  },
];

function projStatusText(s: ProjectRow["status"]): string {
  if (s === "en_cours") return "En cours";
  if (s === "retard") return "Retard";
  if (s === "avance") return "Bonne avance";
  return "Livré";
}

function projectStatusFilterLabel(s: ProjectStatusFilter): string {
  if (s === "all") return "Tous statuts";
  if (s === "en_cours") return "En cours";
  if (s === "retard") return "Retard";
  if (s === "avance") return "Bonne avance";
  return "Livré";
}

function projStatusBadge(s: ProjectRow["status"]) {
  if (s === "en_cours") return <span className="badge y">En cours</span>;
  if (s === "retard") return <span className="badge r">Retard</span>;
  if (s === "avance") return <span className="badge g">Bonne avance</span>;
  return <span className="badge g">Livré</span>;
}

function filterProjectRows(
  rows: ProjectRow[],
  localQ: string,
  globalQ: string,
): ProjectRow[] {
  return rows.filter((r) => {
    const parts = [
      r.name,
      r.client,
      r.owner.initials,
      r.deadline,
      String(r.pct),
      projStatusText(r.status),
    ];
    return matchesSearch(parts, localQ) && matchesSearch(parts, globalQ);
  });
}

function ProjectsTable({
  rows,
  showToolbar,
  filterQuery,
  onFilterQueryChange,
  statusFilter,
  onStatusFilterClick,
  onExportClick,
}: {
  rows: ProjectRow[];
  showToolbar?: boolean;
  filterQuery?: string;
  onFilterQueryChange?: (value: string) => void;
  statusFilter?: ProjectStatusFilter;
  onStatusFilterClick?: () => void;
  onExportClick?: () => void;
}) {
  const { pushToast } = useDashboardUi();
  return (
    <>
      {showToolbar ? (
        <div className="card-head crm-accounts-toolbar-wrap">
          <div>
            <div className="card-title">📋 Portefeuille projets</div>
            <div className="card-sub">Pilotage & livrables</div>
          </div>
          <div className="card-actions fin-invoice-toolbar">
            <input
              type="search"
              className="fin-invoice-search"
              placeholder="Projet, client, resp…"
              aria-label="Filtrer les projets"
              value={filterQuery ?? ""}
              onChange={(e) => onFilterQueryChange?.(e.target.value)}
            />
            <button
              type="button"
              className="ca-btn"
              onClick={onStatusFilterClick}
            >
              {projectStatusFilterLabel(statusFilter ?? "all")}
            </button>
            <button type="button" className="ca-btn" onClick={onExportClick}>
              Export CSV
            </button>
            <button
              type="button"
              className="ca-btn primary"
              onClick={() =>
                pushToast("Nouveau projet (démo) — formulaire à brancher")
              }
            >
              ＋ Nouveau projet
            </button>
          </div>
        </div>
      ) : null}
      <div className="card-table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Projet</th>
              <th>Client</th>
              <th>Responsable</th>
              <th>Délai</th>
              <th>Progression</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td className="bold">{row.name}</td>
                <td>{row.client}</td>
                <td>
                  <span
                    className="av"
                    style={{
                      background: row.owner.bg,
                      color: row.owner.color,
                      width: 22,
                      height: 22,
                      fontSize: 9,
                    }}
                  >
                    {row.owner.initials}
                  </span>
                </td>
                <td
                  style={{
                    fontFamily: "var(--font-dm-mono), monospace",
                    fontSize: 10.5,
                    color: row.deadlineWarn ? "var(--red)" : "var(--fog)",
                  }}
                >
                  {row.deadline}
                </td>
                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div className="prog-bar" style={{ width: 100 }}>
                      <div
                        className="prog-fill"
                        style={{
                          width: `${row.pct}%`,
                          background: row.barColor,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-dm-mono), monospace",
                        fontSize: 10,
                        color: "var(--fog)",
                      }}
                    >
                      {row.pct}%
                    </span>
                  </div>
                </td>
                <td>{projStatusBadge(row.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function MilestonesBlock() {
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <div className="card-title">🗓 Jalons & échéances</div>
          <div className="card-sub">14 prochains jours</div>
        </div>
      </div>
      <div className="card-body crm-rdv-list">
        <ul>
          <li>
            <span className="crm-rdv-date">14 avr.</span>
            <span className="crm-rdv-body">
              <strong>PADDE-CI #014</strong> — Revue intermédiaire avec LONACI
            </span>
          </li>
          <li>
            <span className="crm-rdv-date">16 avr.</span>
            <span className="crm-rdv-body">
              <strong>PRESENZ PRO #012</strong> — Livraison sprint UI (client
              Ouattara)
            </span>
          </li>
          <li>
            <span className="crm-rdv-date">19 avr.</span>
            <span className="crm-rdv-body">
              <strong>Infinite Core Deploy</strong> — Mise en prod pré-prod
            </span>
          </li>
          <li>
            <span className="crm-rdv-date">22 avr.</span>
            <span className="crm-rdv-body">
              <strong>Formation Mktg</strong> — Atelier module 3
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function RisksBlock() {
  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">⚠ Risques actifs</div>
            <div className="card-sub">Priorisation direction projet</div>
          </div>
        </div>
        <div className="card-body crm-prio-body">
          <ul className="crm-prio-list">
            <li>
              <strong>PRESENZ PRO #012</strong> — dérive planning (+10 j.) ·
              ressource design saturée
            </li>
            <li>
              <strong>PADDE-CI</strong> — attente validation juridique côté
              client
            </li>
            <li>
              <strong>Formation Riviera</strong> — salle non confirmée pour
              session 19 avr.
            </li>
          </ul>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">✅ Décisions récentes</div>
            <div className="card-sub">Comité projets</div>
          </div>
        </div>
        <div className="card-body fin-treasury-list">
          <ul>
            <li>
              <strong>08 avr.</strong> — Budget phase 2 LONACI validé
            </li>
            <li>
              <strong>05 avr.</strong> — Scope Community Koffi figé (mensuel)
            </li>
            <li>
              <strong>02 avr.</strong> — Report date livrable Diomandé (+1
              semaine)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ProjectsPage({
  active,
  section,
  onProjectsNavigate,
}: ProjectsPageProps) {
  const { globalSearch, pushToast } = useDashboardUi();
  const [projectQuery, setProjectQuery] = useState("");
  const [projectStatusFilter, setProjectStatusFilter] =
    useState<ProjectStatusFilter>("all");

  const filteredProjects = useMemo(
    () => {
      const bySearch = filterProjectRows(
        PROJECTS,
        section === "portfolio" ? projectQuery : "",
        globalSearch,
      );
      if (projectStatusFilter === "all") return bySearch;
      return bySearch.filter((row) => row.status === projectStatusFilter);
    },
    [section, projectQuery, globalSearch, projectStatusFilter],
  );

  const cycleProjectStatusFilter = () => {
    const order: ProjectStatusFilter[] = [
      "all",
      "en_cours",
      "retard",
      "avance",
      "livre",
    ];
    const idx = order.indexOf(projectStatusFilter);
    setProjectStatusFilter(order[(idx + 1) % order.length]);
  };

  return (
    <div className={`page${active ? " active" : ""}`} id="page-projects">
      <div className="kpi-row">
        <div className="kpi green">
          <div className="kpi-label">Projets actifs</div>
          <div className="kpi-val">23</div>
          <div className="kpi-delta neutral">● 4 pôles</div>
        </div>
        <div className="kpi gold">
          <div className="kpi-label">Taux complétion moy.</div>
          <div className="kpi-val">67%</div>
          <div className="kpi-delta up">▲ +9%</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-label">À livrer cette semaine</div>
          <div className="kpi-val">5</div>
          <div className="kpi-delta neutral">● 2 prioritaires</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-label">En retard</div>
          <div className="kpi-val">3</div>
          <div className="kpi-delta down">▼ Action requise</div>
        </div>
      </div>

      {section === "overview" ? (
        <>
          <div className="grid-2">
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">📊 Charge & livraisons</div>
                  <div className="card-sub">Semaine en cours</div>
                </div>
              </div>
              <div className="card-body">
                <div className="mini-grid crm-overview-mini">
                  <div className="mini-stat">
                    <div className="mini-val" style={{ color: "var(--cobalt3)" }}>
                      5
                    </div>
                    <div className="mini-lbl">Livrables sem.</div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-val" style={{ color: "var(--red)" }}>
                      3
                    </div>
                    <div className="mini-lbl">En retard</div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-val" style={{ color: "var(--gold)" }}>
                      67%
                    </div>
                    <div className="mini-lbl">Complétion</div>
                  </div>
                  <div className="mini-stat">
                    <div
                      className="mini-val"
                      style={{ color: "var(--cobalt3)" }}
                    >
                      2
                    </div>
                    <div className="mini-lbl">Prioritaires</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">⚡ Focus équipe</div>
                  <div className="card-sub">Points d&apos;attention</div>
                </div>
              </div>
              <div className="card-body crm-prio-body">
                <ul className="crm-prio-list">
                  <li>
                    Débloquer <strong>PRESENZ PRO #012</strong> — design
                  </li>
                  <li>
                    Valider recette <strong>Infinite Core Deploy</strong>
                  </li>
                  <li>
                    Préparer comité <strong>LONACI</strong> — 14 avr.
                  </li>
                </ul>
                <div className="crm-prio-actions">
                  <button
                    type="button"
                    className="ca-btn"
                    onClick={() => onProjectsNavigate?.("milestones")}
                  >
                    Jalons
                  </button>
                  <button
                    type="button"
                    className="ca-btn primary"
                    onClick={() => onProjectsNavigate?.("portfolio")}
                  >
                    Portefeuille
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="card crm-overview-accounts">
            <div className="card-head">
              <div>
                <div className="card-title">📌 Projets suivis</div>
                <div className="card-sub">Aperçu</div>
              </div>
              <div className="card-actions">
                <button
                  type="button"
                  className="ca-btn primary"
                  onClick={() => onProjectsNavigate?.("portfolio")}
                >
                  Voir tout
                </button>
              </div>
            </div>
            <ProjectsTable rows={filteredProjects.slice(0, 3)} />
          </div>
        </>
      ) : null}

      {section === "portfolio" ? (
        <div className="card crm-accounts-card">
          <ProjectsTable
            rows={filteredProjects}
            showToolbar
            filterQuery={projectQuery}
            onFilterQueryChange={setProjectQuery}
            statusFilter={projectStatusFilter}
            onStatusFilterClick={cycleProjectStatusFilter}
            onExportClick={() => {
              downloadCsv(
                "projets-portefeuille.csv",
                [
                  "Projet",
                  "Client",
                  "Responsable",
                  "Delai",
                  "Progression %",
                  "Statut",
                ],
                filteredProjects.map((row) => [
                  row.name,
                  row.client,
                  row.owner.initials,
                  row.deadline,
                  row.pct,
                  projStatusText(row.status),
                ]),
              );
              pushToast("Export CSV du portefeuille telecharge");
            }}
          />
        </div>
      ) : null}

      {section === "milestones" ? <MilestonesBlock /> : null}

      {section === "risks" ? <RisksBlock /> : null}
    </div>
  );
}

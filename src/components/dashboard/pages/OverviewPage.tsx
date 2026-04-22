"use client";

import { drawDonut, drawRevChart } from "@/lib/dashboard/chartDrawers";
import { downloadCsv } from "@/lib/dashboard/downloadCsv";
import { matchesSearch } from "@/lib/dashboard/textSearch";
import { useDashboardUi } from "../dashboardUiContext";
import { useEffect, useMemo, useRef } from "react";
import type { DashboardAlert } from "../dashboardAlerts";
import { KpiCount, KpiMillions } from "../kpi";

type MissionRow = {
  initials: string;
  client: string;
  avBg: string;
  avColor?: string;
  mission: string;
  pole: "consulting" | "tech" | "academy";
  status: "livré" | "en_cours" | "jalon" | "retard" | "devis" | "planifié";
  amount: string;
  amountMuted?: boolean;
};

const MISSIONS: MissionRow[] = [
  {
    initials: "KF",
    client: "Kofi & Frères",
    avBg: "var(--gold)",
    avColor: "#000",
    mission: "Audit Rapide",
    pole: "consulting",
    status: "livré",
    amount: "150K",
  },
  {
    initials: "SC",
    client: "Sté Coulibaly",
    avBg: "var(--cobalt2)",
    mission: "Audit Business",
    pole: "consulting",
    status: "en_cours",
    amount: "280K",
  },
  {
    initials: "CD",
    client: "Cabinet Diomandé",
    avBg: "var(--green)",
    mission: "PRESENZ PRO",
    pole: "tech",
    status: "jalon",
    amount: "95K",
  },
  {
    initials: "GO",
    client: "Grp. Ouattara",
    avBg: "var(--purple)",
    mission: "Community Mgmt",
    pole: "consulting",
    status: "retard",
    amount: "120K",
  },
  {
    initials: "AK",
    client: "Awa Koné",
    avBg: "#F59E0B",
    mission: "Infinite Core",
    pole: "tech",
    status: "devis",
    amount: "—",
    amountMuted: true,
  },
  {
    initials: "MT",
    client: "Marc Touré",
    avBg: "#059669",
    mission: "Formation Digital",
    pole: "academy",
    status: "planifié",
    amount: "75K",
  },
];

function missionPoleBadge(p: MissionRow["pole"]) {
  if (p === "tech") return <span className="badge p">Tech</span>;
  if (p === "academy") return <span className="badge g">Academy</span>;
  return <span className="badge b">Consulting</span>;
}

function missionPoleText(p: MissionRow["pole"]): string {
  if (p === "tech") return "Tech";
  if (p === "academy") return "Academy";
  return "Consulting";
}

function missionStatusBadge(s: MissionRow["status"]) {
  if (s === "livré") return <span className="badge g">Livré</span>;
  if (s === "en_cours") return <span className="badge y">En cours</span>;
  if (s === "jalon") return <span className="badge y">J+8/15</span>;
  if (s === "retard") return <span className="badge r">Retard</span>;
  if (s === "devis") return <span className="badge gr">Devis</span>;
  return <span className="badge g">Planifié</span>;
}

function missionStatusText(s: MissionRow["status"]): string {
  if (s === "livré") return "Livré";
  if (s === "en_cours") return "En cours";
  if (s === "jalon") return "J+8/15";
  if (s === "retard") return "Retard";
  if (s === "devis") return "Devis";
  return "Planifié";
}

function filterMissions(rows: MissionRow[], globalQ: string): MissionRow[] {
  return rows.filter((m) =>
    matchesSearch(
      [
        m.initials,
        m.client,
        m.mission,
        missionPoleText(m.pole),
        missionStatusText(m.status),
        m.amount,
      ],
      globalQ,
    ),
  );
}

type OverviewPageProps = {
  active: boolean;
  alerts: DashboardAlert[];
  onRemoveAlert: (id: string) => void;
  onClearAlerts: () => void;
};

export function OverviewPage({
  active,
  alerts,
  onRemoveAlert,
  onClearAlerts,
}: OverviewPageProps) {
  const { globalSearch, pushToast } = useDashboardUi();
  const revenueRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);

  const filteredMissions = useMemo(
    () => filterMissions(MISSIONS, globalSearch),
    [globalSearch],
  );

  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(() => {
      drawRevChart(revenueRef.current);
      drawDonut(donutRef.current);
    }, 100);
    const onResize = () => {
      drawRevChart(revenueRef.current);
      drawDonut(donutRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [active]);

  return (
    <div className={`page${active ? " active" : ""}`} id="page-overview">
      <div className="kpi-row">
        <div className="kpi gold">
          <div className="kpi-label">Chiffre d&apos;affaires — Mois</div>
          <div className="kpi-val">
            <KpiMillions active={active} />
          </div>
          <div className="kpi-delta up">▲ +18% vs mois précédent</div>
          <svg className="kpi-spark" width={80} height={40} viewBox="0 0 80 40">
            <polyline
              points="0,35 12,28 24,30 36,18 48,22 60,10 72,14 80,8"
              fill="none"
              stroke="#e8b84a"
              strokeWidth={1.5}
            />
          </svg>
        </div>
        <div className="kpi blue">
          <div className="kpi-label">Clients actifs</div>
          <div className="kpi-val">
            <KpiCount active={active} target={148} suffix=" clients" />
          </div>
          <div className="kpi-delta up">▲ +6 ce mois</div>
          <svg className="kpi-spark" width={80} height={40} viewBox="0 0 80 40">
            <polyline
              points="0,30 14,25 28,28 42,20 56,22 70,14 80,12"
              fill="none"
              stroke="#4a8ee8"
              strokeWidth={1.5}
            />
          </svg>
        </div>
        <div className="kpi green">
          <div className="kpi-label">Projets en cours</div>
          <div className="kpi-val">
            <KpiCount active={active} target={23} suffix=" actifs" />
          </div>
          <div className="kpi-delta neutral">● 3 en retard</div>
          <svg className="kpi-spark" width={80} height={40} viewBox="0 0 80 40">
            <polyline
              points="0,32 16,28 32,24 48,18 64,20 80,15"
              fill="none"
              stroke="#10B981"
              strokeWidth={1.5}
            />
          </svg>
        </div>
        <div className="kpi purple">
          <div className="kpi-label">Factures impayées</div>
          <div className="kpi-val">
            <KpiCount active={active} target={7} suffix=" en attente" />
          </div>
          <div className="kpi-delta down">▼ 2 en retard</div>
          <svg className="kpi-spark" width={80} height={40} viewBox="0 0 80 40">
            <polyline
              points="0,15 12,20 24,16 36,24 48,20 60,28 72,24 80,30"
              fill="none"
              stroke="#9b7bed"
              strokeWidth={1.5}
            />
          </svg>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">🔔 Alertes du jour</div>
          </div>
          <div className="card-actions">
            <button type="button" className="ca-btn" onClick={onClearAlerts}>
              Tout effacer
            </button>
          </div>
        </div>
        <div className="alerts" id="alerts-container">
          {alerts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 18,
                fontSize: 13,
                color: "var(--fog)",
              }}
            >
              Aucune alerte active ✓
            </div>
          ) : (
            alerts.map((a) => (
              <div key={a.id} className={`alert ${a.kind}`}>
                <span className="alert-ico">{a.icon}</span>
                <div className="alert-text">{a.content}</div>
                <button
                  type="button"
                  className="alert-close"
                  aria-label="Fermer"
                  onClick={() => onRemoveAlert(a.id)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">📈 Revenus — 6 derniers mois</div>
              <div className="card-sub">En milliers de FCFA</div>
            </div>
            <div className="card-actions">
              <button
                type="button"
                className="ca-btn primary"
                onClick={() => {
                  downloadCsv(
                    "dashboard-missions.csv",
                    [
                      "Client",
                      "Mission",
                      "Pole",
                      "Statut",
                      "Montant",
                      "Initiales",
                    ],
                    filteredMissions.map((mission) => [
                      mission.client,
                      mission.mission,
                      missionPoleText(mission.pole),
                      missionStatusText(mission.status),
                      mission.amount,
                      mission.initials,
                    ]),
                  );
                  pushToast("Export CSV des missions telecharge");
                }}
              >
                Export
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="chart-wrap">
              <canvas ref={revenueRef} id="revenueChart" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">🍩 Revenus par pôle</div>
            </div>
          </div>
          <div className="donut-wrap">
            <canvas
              ref={donutRef}
              id="donutChart"
              className="donut-canvas"
              aria-hidden
            />
            <div className="donut-legend">
              <div className="dl-item">
                <div className="dl-dot" style={{ background: "var(--gold)" }} />
                Consulting <div className="dl-pct">42%</div>
              </div>
              <div className="dl-item">
                <div
                  className="dl-dot"
                  style={{ background: "var(--cobalt2)" }}
                />
                Tech & SaaS <div className="dl-pct">31%</div>
              </div>
              <div className="dl-item">
                <div className="dl-dot" style={{ background: "var(--green)" }} />
                Academy <div className="dl-pct">18%</div>
              </div>
              <div className="dl-item">
                <div
                  className="dl-dot"
                  style={{ background: "var(--purple)" }}
                />
                Startup Studio <div className="dl-pct">9%</div>
              </div>
            </div>
          </div>
          <div className="mini-grid">
            <div className="mini-stat">
              <div className="mini-val" style={{ color: "var(--gold)" }}>
                4.2M
              </div>
              <div className="mini-lbl">Consulting</div>
            </div>
            <div className="mini-stat">
              <div className="mini-val" style={{ color: "var(--cobalt3)" }}>
                3.1M
              </div>
              <div className="mini-lbl">Tech</div>
            </div>
            <div className="mini-stat">
              <div className="mini-val" style={{ color: "#34D399" }}>
                1.8M
              </div>
              <div className="mini-lbl">Academy</div>
            </div>
            <div className="mini-stat">
              <div className="mini-val" style={{ color: "#A78BFA" }}>
                0.9M
              </div>
              <div className="mini-lbl">Startup Studio</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2b">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">📁 Dernières missions</div>
              <div className="card-sub">14 actives ce mois</div>
            </div>
            <div className="card-actions">
              <button type="button" className="ca-btn">
                Voir tout
              </button>
            </div>
          </div>
          <div className="card-table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Mission</th>
                  <th>Pôle</th>
                  <th>Statut</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {filteredMissions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: 20,
                        fontSize: 13,
                        color: "var(--fog)",
                      }}
                    >
                      Aucune mission ne correspond à la recherche.
                    </td>
                  </tr>
                ) : (
                  filteredMissions.map((m) => (
                    <tr key={`${m.client}-${m.mission}`}>
                      <td className="bold">
                        <span
                          className="av"
                          style={{
                            background: m.avBg,
                            ...(m.avColor ? { color: m.avColor } : {}),
                          }}
                        >
                          {m.initials}
                        </span>
                        {m.client}
                      </td>
                      <td>{m.mission}</td>
                      <td>{missionPoleBadge(m.pole)}</td>
                      <td>{missionStatusBadge(m.status)}</td>
                      <td
                        style={{
                          fontFamily: "var(--font-dm-mono), monospace",
                          fontSize: 11.5,
                          color: m.amountMuted
                            ? "var(--fog)"
                            : "var(--gold)",
                        }}
                      >
                        {m.amount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">⚡ Activité récente</div>
            </div>
          </div>
          <div className="card-body">
            <div className="activity">
              <div className="act-item">
                <div
                  className="act-dot"
                  style={{ background: "var(--green)" }}
                />
                <div className="act-text">
                  <strong>Paiement reçu</strong> — Sté Coulibaly · 280 000 FCFA
                </div>
                <div className="act-time">il y a 23min</div>
              </div>
              <div className="act-item">
                <div
                  className="act-dot"
                  style={{ background: "var(--gold)" }}
                />
                <div className="act-text">
                  <strong>Nouveau client</strong> — Marc Touré ajouté au CRM
                </div>
                <div className="act-time">il y a 1h</div>
              </div>
              <div className="act-item">
                <div
                  className="act-dot"
                  style={{ background: "var(--cobalt3)" }}
                />
                <div className="act-text">
                  <strong>Rapport livré</strong> — Audit Rapide · Cabinet KF
                </div>
                <div className="act-time">il y a 2h</div>
              </div>
              <div className="act-item">
                <div className="act-dot" style={{ background: "var(--red)" }} />
                <div className="act-text">
                  <strong>Retard signalé</strong> — Projet PRESENZ-012
                </div>
                <div className="act-time">il y a 3h</div>
              </div>
              <div className="act-item">
                <div
                  className="act-dot"
                  style={{ background: "var(--purple)" }}
                />
                <div className="act-text">
                  <strong>Devis envoyé</strong> — Awa Koné · Infinite Core
                </div>
                <div className="act-time">il y a 5h</div>
              </div>
              <div className="act-item">
                <div
                  className="act-dot"
                  style={{ background: "var(--green)" }}
                />
                <div className="act-text">
                  <strong>Session Academy</strong> — Formation Mktg Digital · 12
                  inscrits
                </div>
                <div className="act-time">hier</div>
              </div>
              <div className="act-item">
                <div
                  className="act-dot"
                  style={{ background: "var(--gold)" }}
                />
                <div className="act-text">
                  <strong>Contrat signé</strong> — LONACI · Audit Institutionnel
                </div>
                <div className="act-time">hier</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

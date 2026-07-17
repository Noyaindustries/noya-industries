"use client";

import { drawDonut, drawRevChart } from "@/lib/dashboard/chartDrawers";
import { downloadCsv } from "@/lib/dashboard/downloadCsv";
import type { OverviewData, OverviewMissionDto } from "@/lib/dashboard/overview-data";
import { matchesSearch } from "@/lib/dashboard/textSearch";
import { useDashboardModule } from "@/hooks/useDashboardModule";
import { useDashboardUi } from "../dashboardUiContext";
import { useEffect, useMemo, useRef } from "react";
import type { DashboardAlert } from "../dashboardAlerts";
import { KpiCount, KpiMillions } from "../kpi";

function missionPoleBadge(p: OverviewMissionDto["pole"]) {
  if (p === "tech") return <span className="badge p">Tech</span>;
  if (p === "academy") return <span className="badge g">Academy</span>;
  return <span className="badge b">Consulting</span>;
}

function missionPoleText(p: OverviewMissionDto["pole"]): string {
  if (p === "tech") return "Tech";
  if (p === "academy") return "Academy";
  return "Consulting";
}

function missionStatusBadge(s: OverviewMissionDto["status"]) {
  if (s === "livré") return <span className="badge g">Livré</span>;
  if (s === "en_cours") return <span className="badge y">En cours</span>;
  if (s === "jalon") return <span className="badge y">J+8/15</span>;
  if (s === "retard") return <span className="badge r">Retard</span>;
  if (s === "devis") return <span className="badge gr">Devis</span>;
  return <span className="badge g">Planifié</span>;
}

function missionStatusText(s: OverviewMissionDto["status"]): string {
  if (s === "livré") return "Livré";
  if (s === "en_cours") return "En cours";
  if (s === "jalon") return "J+8/15";
  if (s === "retard") return "Retard";
  if (s === "devis") return "Devis";
  return "Planifié";
}

function filterMissions(rows: OverviewMissionDto[], globalQ: string): OverviewMissionDto[] {
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

function abbrevMillions(fcfa: number): string {
  if (fcfa >= 1_000_000) return `${(fcfa / 1_000_000).toFixed(1)}M`;
  if (fcfa >= 1_000) return `${Math.round(fcfa / 1_000)}K`;
  return "0";
}

type OverviewPageProps = {
  active: boolean;
  alerts: DashboardAlert[];
  onRemoveAlert: (id: string) => void;
  onClearAlerts: () => void;
};

const EMPTY_MISSIONS: OverviewData["missions"] = [];
const EMPTY_POLES: OverviewData["poles"] = [];

export function OverviewPage({
  active,
  alerts,
  onRemoveAlert,
  onClearAlerts,
}: OverviewPageProps) {
  const { globalSearch, pushToast } = useDashboardUi();
  const { data } = useDashboardModule<OverviewData>("/api/dashboard/overview", active);
  const revenueRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);

  const kpis = data?.kpis;
  const missions = data?.missions ?? EMPTY_MISSIONS;
  const poles = data?.poles ?? EMPTY_POLES;
  const activities = data?.activities ?? [];

  const filteredMissions = useMemo(
    () => filterMissions(missions, globalSearch),
    [missions, globalSearch],
  );

  const chartRevenue = useMemo(
    () =>
      data?.revenueHistory.map((point) => ({
        value: Math.round(point.value / 1000),
        label: point.label,
      })) ?? [],
    [data?.revenueHistory],
  );

  const donutSegments = useMemo(
    () =>
      poles.map((pole) => ({
        v: pole.pct,
        c0: pole.colorSoft,
        c1: pole.color,
      })),
    [poles],
  );

  const revenueMillions = (kpis?.revenueMonthFcfa ?? 12_400_000) / 1_000_000;

  useEffect(() => {
    if (!active || !data) return;
    const draw = () => {
      drawRevChart(revenueRef.current, {
        data: chartRevenue.map((p) => p.value),
        months: chartRevenue.map((p) => p.label),
      });
      drawDonut(donutRef.current, {
        segments: donutSegments.length > 0 ? donutSegments : undefined,
        centerLabel: abbrevMillions(data.totalRevenueFcfa),
      });
    };
    const t = window.setTimeout(draw, 100);
    window.addEventListener("resize", draw);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", draw);
    };
  }, [active, data, chartRevenue, donutSegments]);

  return (
    <div className={`page${active ? " active" : ""}`} id="page-overview">
      <section className="db-premium-hero" aria-label="Vue d'ensemble">
        <p className="db-hero-eyebrow">Infinite Core · Noya Industries</p>
        <h2 className="db-hero-title">Pilotage stratégique en temps réel</h2>
        <p className="db-hero-lead">
          Finance, clients, projets et équipe — un centre de commande unifié pour
          accélérer vos décisions et suivre la performance du groupe.
        </p>
        <div className="db-hero-meta">
          <span className="db-hero-chip">📊 {poles.length || 4} pôles actifs</span>
          <span className="db-hero-chip">🌍 Abidjan · CI</span>
          <span className="db-hero-chip">⚡ Mise à jour live</span>
        </div>
      </section>

      <div className="kpi-row">
        <div className="kpi gold">
          <div className="kpi-label">Chiffre d&apos;affaires — Mois</div>
          <div className="kpi-val">
            <KpiMillions active={active} millions={revenueMillions} />
          </div>
          <div className="kpi-delta up">{kpis?.revenueMonthDelta ?? "—"}</div>
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
            <KpiCount
              active={active}
              target={kpis?.activeClients ?? 0}
              suffix=" clients"
            />
          </div>
          <div className="kpi-delta up">{kpis?.clientsDelta ?? "—"}</div>
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
            <KpiCount
              active={active}
              target={kpis?.activeProjects ?? 0}
              suffix=" actifs"
            />
          </div>
          <div className="kpi-delta neutral">
            ● {kpis?.projectsLate ?? 0} en retard
          </div>
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
            <KpiCount
              active={active}
              target={kpis?.unpaidInvoices ?? 0}
              suffix=" en attente"
            />
          </div>
          <div className="kpi-delta down">
            ▼ {kpis?.invoicesLate ?? 0} en retard
          </div>
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
              {poles.map((pole) => (
                <div className="dl-item" key={pole.key}>
                  <div className="dl-dot" style={{ background: pole.color }} />
                  {pole.label} <div className="dl-pct">{pole.pct}%</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mini-grid">
            {poles.slice(0, 4).map((pole) => (
              <div className="mini-stat" key={pole.key}>
                <div className="mini-val" style={{ color: pole.color }}>
                  {abbrevMillions(pole.amountFcfa)}
                </div>
                <div className="mini-lbl">{pole.label.split(" ")[0]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2b">
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">📁 Dernières missions</div>
              <div className="card-sub">
                {kpis?.activeProjects ?? 0} actives ce mois
              </div>
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
              {activities.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 18,
                    fontSize: 13,
                    color: "var(--fog)",
                  }}
                >
                  Aucune activité récente.
                </div>
              ) : (
                activities.map((act, index) => (
                  <div className="act-item" key={`${act.title}-${index}`}>
                    <div
                      className="act-dot"
                      style={{ background: act.dotColor }}
                    />
                    <div className="act-text">
                      <strong>{act.title}</strong> — {act.detail}
                    </div>
                    <div className="act-time">{act.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

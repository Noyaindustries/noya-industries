"use client";

import type { HrSectionId } from "@/lib/dashboard/hrNav";
import { TeamMembersManager } from "@/components/dashboard/team/TeamMembersManager";
import { useDashboardModule } from "@/hooks/useDashboardModule";
import { useDashboardUi } from "../dashboardUiContext";
import { useEffect, useState } from "react";

type HrPageProps = {
  active: boolean;
  section: HrSectionId;
  onHrNavigate?: (s: HrSectionId) => void;
};


function WorkloadBars() {
  return (
    <div className="prog-row">
      <div className="prog-item">
        <div className="prog-top">
          <div className="prog-name">Yannick N&apos;guessan</div>
          <div className="prog-pct">88%</div>
        </div>
        <div className="prog-bar">
          <div
            className="prog-fill"
            style={{ width: "88%", background: "var(--red)" }}
          />
        </div>
      </div>
      <div className="prog-item">
        <div className="prog-top">
          <div className="prog-name">Jean-Loïc Koné</div>
          <div className="prog-pct">72%</div>
        </div>
        <div className="prog-bar">
          <div
            className="prog-fill"
            style={{ width: "72%", background: "var(--gold)" }}
          />
        </div>
      </div>
      <div className="prog-item">
        <div className="prog-top">
          <div className="prog-name">Kouassi Stéphane</div>
          <div className="prog-pct">95%</div>
        </div>
        <div className="prog-bar">
          <div
            className="prog-fill"
            style={{ width: "95%", background: "var(--red)" }}
          />
        </div>
      </div>
      <div className="prog-item">
        <div className="prog-top">
          <div className="prog-name">Aminata Touré</div>
          <div className="prog-pct">55%</div>
        </div>
        <div className="prog-bar">
          <div
            className="prog-fill"
            style={{ width: "55%", background: "var(--green)" }}
          />
        </div>
      </div>
      <div className="prog-item">
        <div className="prog-top">
          <div className="prog-name">Stéphane Konan</div>
          <div className="prog-pct">80%</div>
        </div>
        <div className="prog-bar">
          <div
            className="prog-fill"
            style={{ width: "80%", background: "var(--gold)" }}
          />
        </div>
      </div>
    </div>
  );
}

type LeaveRow = {
  id: string;
  employeeName: string;
  periodLabel: string;
  durationLabel: string;
  reason: string;
  status: string;
};

function leaveStatusBadge(status: string) {
  if (status === "approved") return <span className="badge g">Approuvé</span>;
  if (status === "pending") return <span className="badge y">En attente</span>;
  return <span className="badge b">Examiné</span>;
}

function LeaveRequestsTable({
  leaves,
  onApprove,
}: {
  leaves: LeaveRow[];
  onApprove?: (id: string) => void;
}) {
  return (
    <div className="card-table-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th>Employé</th>
            <th>Période</th>
            <th>Durée</th>
            <th>Motif</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {leaves.length === 0 ? (
            <tr>
              <td colSpan={6}>Aucune demande de congé.</td>
            </tr>
          ) : (
            leaves.map((row) => (
              <tr key={row.id}>
                <td className="bold">{row.employeeName}</td>
                <td style={{ fontFamily: "var(--font-dm-mono), monospace", fontSize: 10.5 }}>
                  {row.periodLabel}
                </td>
                <td>{row.durationLabel}</td>
                <td>{row.reason}</td>
                <td>{leaveStatusBadge(row.status)}</td>
                <td>
                  {row.status === "pending" && onApprove ? (
                    <button type="button" className="ca-btn" onClick={() => onApprove(row.id)}>
                      Approuver
                    </button>
                  ) : null}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function HrPage({ active, section, onHrNavigate }: HrPageProps) {
  const [openCreateKey, setOpenCreateKey] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const { pushToast } = useDashboardUi();
  const { data: leavesData, reload: reloadLeaves } = useDashboardModule<{ leaves: LeaveRow[] }>(
    "/api/dashboard/hr/leaves",
    active,
  );

  const leaves = leavesData?.leaves ?? [];

  useEffect(() => {
    if (!active) return;
    void fetch("/api/dashboard/team", { cache: "no-store" })
      .then(async (r) => r.json())
      .then((d: { members?: unknown[] }) => setTeamCount(d.members?.length ?? 0))
      .catch(() => setTeamCount(0));
  }, [active]);

  async function addLeaveRequest() {
    const employeeName = window.prompt("Nom de l'employé ?");
    if (!employeeName?.trim()) return;
    const response = await fetch("/api/dashboard/hr/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeName: employeeName.trim(),
        periodLabel: window.prompt("Période ?") ?? "—",
        durationLabel: window.prompt("Durée ?") ?? "—",
        reason: window.prompt("Motif ?") ?? "Congé",
      }),
    });
    if (!response.ok) {
      pushToast("Impossible d'enregistrer la demande.");
      return;
    }
    pushToast("Demande de congé enregistrée.");
    void reloadLeaves();
  }

  async function approveLeave(id: string) {
    const response = await fetch("/api/dashboard/hr/leaves", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "approved" }),
    });
    if (!response.ok) {
      pushToast("Validation impossible.");
      return;
    }
    pushToast("Congé approuvé.");
    void reloadLeaves();
  }

  return (
    <div className={`page${active ? " active" : ""}`} id="page-hr">
      <div className="hr-team-add-cta blog-more">
        <button
          type="button"
          className="btn-hero"
          onClick={() => {
            onHrNavigate?.("team");
            setOpenCreateKey((value) => value + 1);
          }}
        >
          Ajouter un membre
        </button>
      </div>

      <div className="kpi-row">
        <div className="kpi gold">
          <div className="kpi-label">Effectif total</div>
          <div className="kpi-val">{teamCount}</div>
          <div className="kpi-delta neutral">● Équipe publiée</div>
        </div>
        <div className="kpi green">
          <div className="kpi-label">Présents aujourd&apos;hui</div>
          <div className="kpi-val">6</div>
          <div className="kpi-delta neutral">● 2 en télétravail</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-label">Masse salariale/mois</div>
          <div className="kpi-val">218K</div>
          <div className="kpi-delta neutral">● FCFA</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-label">Congés en cours</div>
          <div className="kpi-val">{leaves.filter((l) => l.status === "approved").length}</div>
          <div className="kpi-delta neutral">● {leaves.length} demandes</div>
        </div>
      </div>

      {section === "overview" ? (
        <>
          <div className="grid-2">
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">👥 Effectif — instantané</div>
                  <div className="card-sub">Présence & contrats</div>
                </div>
              </div>
              <div className="card-body">
                <div className="mini-grid crm-overview-mini">
                  <div className="mini-stat">
                    <div className="mini-val" style={{ color: "var(--green)" }}>
                      6
                    </div>
                    <div className="mini-lbl">Présents</div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-val" style={{ color: "var(--cobalt3)" }}>
                      2
                    </div>
                    <div className="mini-lbl">TT / Abs.</div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-val" style={{ color: "var(--gold)" }}>
                      3
                    </div>
                    <div className="mini-lbl">Demandes congés</div>
                  </div>
                  <div className="mini-stat">
                    <div
                      className="mini-val"
                      style={{ color: "var(--purple)" }}
                    >
                      218K
                    </div>
                    <div className="mini-lbl">Masse sal.</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">📋 À traiter</div>
                  <div className="card-sub">RH & managers</div>
                </div>
              </div>
              <div className="card-body crm-prio-body">
                <ul className="crm-prio-list">
                  <li>Valider congé <strong>A. Touré</strong> (18-19 avr.)</li>
                  <li>Examiner demande <strong>S. Konan</strong> (formation)</li>
                  <li>Point 1:1 <strong>K. Stéphane</strong> — charge projet</li>
                </ul>
                <div className="crm-prio-actions">
                  <button
                    type="button"
                    className="ca-btn"
                    onClick={() => onHrNavigate?.("absences")}
                  >
                    Congés
                  </button>
                  <button
                    type="button"
                    className="ca-btn primary"
                    onClick={() => onHrNavigate?.("team")}
                  >
                    Équipe
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="card crm-overview-accounts">
            <div className="card-head">
              <div>
                <div className="card-title">🗓 Aperçu congés</div>
                <div className="card-sub">Demandes récentes</div>
              </div>
            </div>
            <LeaveRequestsTable leaves={leaves} onApprove={(id) => void approveLeave(id)} />
          </div>
        </>
      ) : null}

      {section === "team" ? (
        <TeamMembersManager openCreateKey={openCreateKey} />
      ) : null}

      {section === "workload" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">📊 Charge de travail</div>
              <div className="card-sub">Allocation projets (indicatif)</div>
            </div>
          </div>
          <div className="card-body">
            <WorkloadBars />
          </div>
        </div>
      ) : null}

      {section === "absences" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">🗓 Demandes de congés</div>
              <div className="card-sub">Validation & historique court</div>
            </div>
            <div className="card-actions">
              <button type="button" className="ca-btn primary" onClick={() => void addLeaveRequest()}>
                Nouvelle demande
              </button>
            </div>
          </div>
          <LeaveRequestsTable leaves={leaves} onApprove={(id) => void approveLeave(id)} />
        </div>
      ) : null}
    </div>
  );
}

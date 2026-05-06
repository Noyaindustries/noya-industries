"use client";

import type { HrSectionId } from "@/lib/dashboard/hrNav";
import { TeamMembersManager } from "@/components/dashboard/team/TeamMembersManager";
import { useState } from "react";

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

function LeaveRequestsTable() {
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
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Mariama Baldé</td>
            <td
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: 10.5,
              }}
            >
              07-12 Avr
            </td>
            <td>5 jours</td>
            <td>Congé annuel</td>
            <td>
              <span className="badge g">Approuvé</span>
            </td>
          </tr>
          <tr>
            <td>Aminata Touré</td>
            <td
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: 10.5,
              }}
            >
              18-19 Avr
            </td>
            <td>2 jours</td>
            <td>Personnel</td>
            <td>
              <span className="badge y">En attente</span>
            </td>
          </tr>
          <tr>
            <td>Stéphane Konan</td>
            <td
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: 10.5,
              }}
            >
              28 Avr - 02 Mai
            </td>
            <td>5 jours</td>
            <td>Formation</td>
            <td>
              <span className="badge b">Examiné</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function HrPage({ active, section, onHrNavigate }: HrPageProps) {
  const [openCreateKey, setOpenCreateKey] = useState(0);

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
          <div className="kpi-val">8</div>
          <div className="kpi-delta neutral">● 3 CDI + 5 Prestataires</div>
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
          <div className="kpi-val">1</div>
          <div className="kpi-delta neutral">● 3 demandes</div>
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
            <LeaveRequestsTable />
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
              <button
                type="button"
                className="ca-btn primary"
                onClick={() => {
                  onHrNavigate?.("team");
                }}
              >
                Nouvelle demande
              </button>
            </div>
          </div>
          <LeaveRequestsTable />
        </div>
      ) : null}
    </div>
  );
}

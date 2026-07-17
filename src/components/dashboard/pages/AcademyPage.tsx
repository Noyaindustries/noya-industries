"use client";

import type { AcademySectionId } from "@/lib/dashboard/academyNav";
import { matchesSearch } from "@/lib/dashboard/textSearch";
import { useDashboardModule } from "@/hooks/useDashboardModule";
import { useDashboardUi } from "../dashboardUiContext";
import { useMemo, useState } from "react";

type AcademyPageProps = {
  active: boolean;
  section: AcademySectionId;
  onAcademyNavigate?: (s: AcademySectionId) => void;
};

type AcademyApiProgram = {
  slug: string;
  name: string;
  type: string;
  learners: number;
  progress: number;
  nextSession: string;
};

const EMPTY_PROGRAMS: AcademyApiProgram[] = [];

function academyProgramTypeLabel(t: string): string {
  if (t === "presentiel") return "Présentiel";
  if (t === "ligne") return "En ligne";
  return "Hybride";
}

export function AcademyPage({ active, section, onAcademyNavigate }: AcademyPageProps) {
  const { globalSearch, pushToast } = useDashboardUi();
  const [localQ, setLocalQ] = useState("");
  const { data, reload } = useDashboardModule<{ programs: AcademyApiProgram[] }>(
    "/api/dashboard/academy",
    active,
  );

  const programs = data?.programs ?? EMPTY_PROGRAMS;
  const totalLearners = programs.reduce((s, p) => s + p.learners, 0);

  const filteredPrograms = useMemo(
    () =>
      programs.filter((r) => {
        const parts = [r.name, academyProgramTypeLabel(r.type), String(r.learners), String(r.progress), r.nextSession];
        return matchesSearch(parts, localQ) && matchesSearch(parts, globalSearch);
      }),
    [programs, localQ, globalSearch],
  );

  async function addProgram() {
    const name = window.prompt("Nom du programme ?");
    if (!name?.trim()) return;
    const response = await fetch("/api/dashboard/academy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), type: "presentiel", learners: 0, progress: 0 }),
    });
    if (!response.ok) {
      pushToast("Impossible de créer le programme.");
      return;
    }
    pushToast("Programme Academy créé.");
    void reload();
  }

  return (
    <div className={`page${active ? " active" : ""}`} id="page-academy">
      <div className="kpi-row">
        <div className="kpi gold">
          <div className="kpi-label">Programmes actifs</div>
          <div className="kpi-val">{programs.length}</div>
          <div className="kpi-delta up">▲ Noya Academy</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-label">Apprenants</div>
          <div className="kpi-val">{totalLearners}</div>
          <div className="kpi-delta neutral">● Inscrits</div>
        </div>
        <div className="kpi green">
          <div className="kpi-label">Sessions à venir</div>
          <div className="kpi-val">{programs.filter((p) => p.progress < 100).length}</div>
          <div className="kpi-delta neutral">● En cours</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-label">Taux complétion moy.</div>
          <div className="kpi-val">
            {programs.length
              ? Math.round(programs.reduce((s, p) => s + p.progress, 0) / programs.length)
              : 0}
            %
          </div>
          <div className="kpi-delta up">▲ Global</div>
        </div>
      </div>

      {section === "overview" ? (
        <div className="grid-2">
          <button type="button" className="fin-report-tile" onClick={() => onAcademyNavigate?.("programs")}>
            <span className="fin-report-ico">🎓</span>
            <span className="fin-report-t">Programmes</span>
            <span className="fin-report-d">{programs.length} formations</span>
          </button>
          <button type="button" className="fin-report-tile" onClick={() => onAcademyNavigate?.("calendar")}>
            <span className="fin-report-ico">📅</span>
            <span className="fin-report-t">Calendrier</span>
            <span className="fin-report-d">Prochaines sessions</span>
          </button>
        </div>
      ) : null}

      {section === "programs" && (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">🎓 Programmes Academy</div>
              <div className="card-sub">Catalogue formations Noya</div>
            </div>
            <div className="card-actions">
              <input
                type="search"
                className="fin-invoice-search"
                placeholder="Programme, type…"
                value={localQ}
                onChange={(e) => setLocalQ(e.target.value)}
              />
              <button type="button" className="ca-btn primary" onClick={() => void addProgram()}>
                ＋ Programme
              </button>
            </div>
          </div>
          <div className="card-table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Type</th>
                  <th>Apprenants</th>
                  <th>Avancement</th>
                  <th>Prochaine session</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((r) => (
                  <tr key={r.slug}>
                    <td className="bold">{r.name}</td>
                    <td>
                      <span className="badge b">{academyProgramTypeLabel(r.type)}</span>
                    </td>
                    <td>{r.learners}</td>
                    <td>
                      <div className="prog-bar" style={{ width: 80, display: "inline-block" }}>
                        <div
                          className="prog-fill"
                          style={{
                            width: `${r.progress}%`,
                            background: r.progress >= 80 ? "var(--green)" : r.progress >= 50 ? "var(--gold)" : "var(--cobalt2)",
                          }}
                        />
                      </div>
                    </td>
                    <td>{r.nextSession}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {section === "calendar" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">📅 Calendrier des sessions</div>
            </div>
          </div>
          <div className="card-body">
            <ul className="crm-prio-list">
              {programs
                .filter((p) => p.nextSession !== "Terminé" && p.nextSession !== "En continu")
                .map((p) => (
                  <li key={p.slug}>
                    <strong>{p.nextSession}</strong> — {p.name} ({academyProgramTypeLabel(p.type)})
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ) : null}

      {section === "learners" ? (
        <div className="card">
          <div className="card-body db-stub">
            <div className="db-stub-ico">👥</div>
            <div className="db-stub-title">{totalLearners} apprenants inscrits</div>
            <div className="db-stub-desc">
              Répartition par programme — consultez l&apos;onglet Programmes pour le détail.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

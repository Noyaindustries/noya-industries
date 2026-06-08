"use client";

import type { CommsSectionId } from "@/lib/dashboard/commsNav";
import { matchesSearch } from "@/lib/dashboard/textSearch";
import { useDashboardModule } from "@/hooks/useDashboardModule";
import { useDashboardUi } from "../dashboardUiContext";
import { useMemo, useState } from "react";

type CommsPageProps = {
  active: boolean;
  section: CommsSectionId;
  onCommsNavigate?: (s: CommsSectionId) => void;
};

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  topic?: string | null;
  message: string;
  status: string;
  createdAt: string;
};

type CommsTemplate = {
  slug: string;
  name: string;
  channel: string;
  subject: string;
  body: string;
};

export function CommsPage({ active, section, onCommsNavigate }: CommsPageProps) {
  const { globalSearch, pushToast } = useDashboardUi();
  const [inboxQuery, setInboxQuery] = useState("");
  const { data, reload } = useDashboardModule<{
    messages: ContactMessage[];
    templates: CommsTemplate[];
  }>("/api/dashboard/comms", active);

  const messages = data?.messages ?? [];
  const templates = data?.templates ?? [];
  const unread = messages.filter((m) => m.status === "new");

  const filteredInbox = useMemo(
    () =>
      messages.filter((m) =>
        matchesSearch(
          [m.name, m.email, m.company ?? "", m.topic ?? "", m.message, m.status],
          inboxQuery,
        ) && matchesSearch([m.name, m.email, m.message], globalSearch),
      ),
    [messages, inboxQuery, globalSearch],
  );

  async function markMessage(id: string, status: "read" | "archived") {
    const response = await fetch("/api/dashboard/comms", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) {
      pushToast("Mise à jour impossible.");
      return;
    }
    void reload();
  }

  return (
    <div className={`page${active ? " active" : ""}`} id="page-comms">
      <div className="kpi-row">
        <div className="kpi gold">
          <div className="kpi-label">Messages reçus</div>
          <div className="kpi-val">{messages.length}</div>
          <div className="kpi-delta neutral">● Boîte site</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-label">Non lus</div>
          <div className="kpi-val">{unread.length}</div>
          <div className="kpi-delta up">▲ À traiter</div>
        </div>
        <div className="kpi green">
          <div className="kpi-label">Modèles</div>
          <div className="kpi-val">{templates.length}</div>
          <div className="kpi-delta neutral">● Templates email</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-label">Campagnes</div>
          <div className="kpi-val">0</div>
          <div className="kpi-delta neutral">● Bientôt</div>
        </div>
      </div>

      {section === "overview" ? (
        <div className="grid-2">
          <button type="button" className="fin-report-tile" onClick={() => onCommsNavigate?.("inbox")}>
            <span className="fin-report-ico">✉️</span>
            <span className="fin-report-t">Boîte de réception</span>
            <span className="fin-report-d">{unread.length} non lus</span>
          </button>
          <button type="button" className="fin-report-tile" onClick={() => onCommsNavigate?.("templates")}>
            <span className="fin-report-ico">📝</span>
            <span className="fin-report-t">Modèles</span>
            <span className="fin-report-d">{templates.length} templates</span>
          </button>
        </div>
      ) : null}

      {section === "inbox" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">✉️ Boîte de réception</div>
              <div className="card-sub">Messages du formulaire contact</div>
            </div>
            <div className="card-actions">
              <input
                type="search"
                className="fin-invoice-search"
                placeholder="Rechercher…"
                value={inboxQuery}
                onChange={(e) => setInboxQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="card-table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Expéditeur</th>
                  <th>Sujet</th>
                  <th>Message</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInbox.length === 0 ? (
                  <tr>
                    <td colSpan={5}>Aucun message pour le moment.</td>
                  </tr>
                ) : (
                  filteredInbox.map((m) => (
                    <tr key={m.id}>
                      <td className="bold">
                        {m.name}
                        <br />
                        <span style={{ fontSize: 10, color: "var(--fog)" }}>{m.email}</span>
                      </td>
                      <td>{m.topic ?? "Contact"}</td>
                      <td>{m.message.slice(0, 80)}{m.message.length > 80 ? "…" : ""}</td>
                      <td>
                        <span className={`badge ${m.status === "new" ? "y" : m.status === "read" ? "g" : "b"}`}>
                          {m.status === "new" ? "Nouveau" : m.status === "read" ? "Lu" : "Archivé"}
                        </span>
                      </td>
                      <td>
                        {m.status === "new" ? (
                          <button type="button" className="ca-btn" onClick={() => void markMessage(m.id, "read")}>
                            Marquer lu
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {section === "templates" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">📝 Modèles de communication</div>
              <div className="card-sub">Emails prêts à l&apos;emploi</div>
            </div>
          </div>
          <div className="card-body">
            <div className="blog-form-grid">
              {templates.map((t) => (
                <div key={t.slug} className="card" style={{ margin: 0 }}>
                  <div className="card-head">
                    <div>
                      <div className="card-title">{t.name}</div>
                      <div className="card-sub">{t.channel} · {t.subject}</div>
                    </div>
                  </div>
                  <div className="card-body">
                    <pre style={{ whiteSpace: "pre-wrap", fontSize: 12, color: "var(--fog)" }}>{t.body}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {section === "campaigns" ? (
        <div className="card">
          <div className="card-body db-stub">
            <div className="db-stub-ico">📣</div>
            <div className="db-stub-title">Campagnes email</div>
            <div className="db-stub-desc">
              Module campagnes en préparation — utilisez la boîte et les modèles pour l&apos;instant.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

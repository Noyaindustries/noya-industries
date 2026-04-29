"use client";

import type { AcademySectionId } from "@/lib/dashboard/academyNav";
import { matchesSearch } from "@/lib/dashboard/textSearch";
import { useDashboardUi } from "../dashboardUiContext";
import { useMemo, useState } from "react";
import type { CommsSectionId } from "@/lib/dashboard/commsNav";
import type { SettingsSectionId } from "@/lib/dashboard/settingsNav";
import type { StockSectionId } from "@/lib/dashboard/stockNav";

type StockPageProps = {
  active: boolean;
  section: StockSectionId;
  onStockNavigate?: (s: StockSectionId) => void;
};

type CommsPageProps = {
  active: boolean;
  section: CommsSectionId;
  onCommsNavigate?: (s: CommsSectionId) => void;
};

type AcademyPageProps = {
  active: boolean;
  section: AcademySectionId;
  onAcademyNavigate?: (s: AcademySectionId) => void;
};

type SettingsPageProps = {
  active: boolean;
  section: SettingsSectionId;
  onSettingsNavigate?: (s: SettingsSectionId) => void;
};

type StockSkuRow = {
  ref: string;
  label: string;
  category: string;
  qty: string;
  price: string;
};

const RECRUITMENT_URL =
  process.env.NEXT_PUBLIC_NOYA_RECRUTEMENT_URL ?? "/recrutement#travailler-avec-nous";

const STOCK_CATALOG_ROWS: StockSkuRow[] = [
  {
    ref: "NK-PAPER-A4",
    label: "Ramette papier A4",
    category: "Fournitures",
    qty: "48",
    price: "3 500",
  },
  {
    ref: "NK-TONER-HP",
    label: "Toner HP compatible",
    category: "Informatique",
    qty: "6",
    price: "22 000",
  },
  {
    ref: "NK-CAFE-1KG",
    label: "Café grain 1 kg",
    category: "Accueil",
    qty: "12",
    price: "8 500",
  },
];

const ACADEMY_PROGRAM_ROWS = [
  {
    name: "Marketing Digital Fondamentaux",
    type: "présentiel" as const,
    learners: 24,
    pct: 60,
    next: "14 Avr",
  },
  {
    name: "Gestion Digitale PME",
    type: "ligne" as const,
    learners: 38,
    pct: 82,
    next: "En continu",
  },
  {
    name: "Leadership & Management",
    type: "présentiel" as const,
    learners: 12,
    pct: 30,
    next: "19 Avr",
  },
  {
    name: "Community Management",
    type: "hybride" as const,
    learners: 10,
    pct: 100,
    next: "Terminé",
  },
];

function academyProgramTypeLabel(
  t: (typeof ACADEMY_PROGRAM_ROWS)[number]["type"],
): string {
  if (t === "présentiel") return "Présentiel";
  if (t === "ligne") return "En ligne";
  return "Hybride";
}

function filterAcademyPrograms(
  rows: typeof ACADEMY_PROGRAM_ROWS,
  localQ: string,
  globalQ: string,
) {
  return rows.filter((r) => {
    const parts = [
      r.name,
      academyProgramTypeLabel(r.type),
      String(r.learners),
      String(r.pct),
      r.next,
    ];
    return matchesSearch(parts, localQ) && matchesSearch(parts, globalQ);
  });
}

function AcademyProgramsTable({ rows }: { rows: typeof ACADEMY_PROGRAM_ROWS }) {
  return (
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
        {rows.map((r) => (
          <tr key={r.name}>
            <td className="bold">{r.name}</td>
            <td>
              {r.type === "présentiel" ? (
                <span className="badge b">Présentiel</span>
              ) : null}
              {r.type === "ligne" ? (
                <span className="badge p">En ligne</span>
              ) : null}
              {r.type === "hybride" ? (
                <span className="badge g">Hybride</span>
              ) : null}
            </td>
            <td
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
              }}
            >
              {r.learners}
            </td>
            <td>
              <div
                className="prog-bar"
                style={{ width: 80, display: "inline-block" }}
              >
                <div
                  className="prog-fill"
                  style={{
                    width: `${r.pct}%`,
                    background:
                      r.pct >= 80
                        ? "var(--green)"
                        : r.pct >= 50
                          ? "var(--gold)"
                          : "var(--cobalt2)",
                  }}
                />
              </div>
            </td>
            <td
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: 10.5,
              }}
            >
              {r.next}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function StockPage({
  active,
  section,
  onStockNavigate,
}: StockPageProps) {
  const { globalSearch, pushToast } = useDashboardUi();
  const [catalogQuery, setCatalogQuery] = useState("");

  const filteredCatalog = useMemo(
    () =>
      STOCK_CATALOG_ROWS.filter(
        (r) =>
          matchesSearch(
            [r.ref, r.label, r.category, r.qty, r.price],
            section === "catalog" ? catalogQuery : "",
          ) &&
          matchesSearch(
            [r.ref, r.label, r.category, r.qty, r.price],
            globalSearch,
          ),
      ),
    [section, catalogQuery, globalSearch],
  );

  return (
    <div className={`page${active ? " active" : ""}`} id="page-stock">
      <div className="kpi-row">
        <div className="kpi gold">
          <div className="kpi-label">Articles en stock</div>
          <div className="kpi-val">142</div>
          <div className="kpi-delta neutral">● 6 catégories</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-label">Valeur stock</div>
          <div className="kpi-val">840K</div>
          <div className="kpi-delta up">▲ FCFA</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-label">Commandes en cours</div>
          <div className="kpi-val">4</div>
          <div className="kpi-delta neutral">● 2 fournisseurs</div>
        </div>
        <div className="kpi green">
          <div className="kpi-label">Alertes stock bas</div>
          <div className="kpi-val">7</div>
          <div className="kpi-delta down">▼ Réappro.</div>
        </div>
      </div>

      {section === "overview" ? (
        <>
          <div className="grid-2">
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">📦 Stock — lecture rapide</div>
                  <div className="card-sub">Valeur & rotation</div>
                </div>
              </div>
              <div className="card-body">
                <div className="mini-grid crm-overview-mini">
                  <div className="mini-stat">
                    <div className="mini-val" style={{ color: "var(--gold)" }}>
                      840K
                    </div>
                    <div className="mini-lbl">Valeur</div>
                  </div>
                  <div className="mini-stat">
                    <div className="mini-val" style={{ color: "var(--red)" }}>
                      7
                    </div>
                    <div className="mini-lbl">Alertes</div>
                  </div>
                  <div className="mini-stat">
                    <div
                      className="mini-val"
                      style={{ color: "var(--cobalt3)" }}
                    >
                      4
                    </div>
                    <div className="mini-lbl">Commandes</div>
                  </div>
                  <div className="mini-stat">
                    <div
                      className="mini-val"
                      style={{ color: "var(--purple)" }}
                    >
                      142
                    </div>
                    <div className="mini-lbl">SKU</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title">⚡ Actions</div>
                </div>
              </div>
              <div className="card-body crm-prio-body">
                <ul className="crm-prio-list">
                  <li>Réappro <strong>Cartouches toner</strong> — seuil 5</li>
                  <li>BC fournisseur <strong>TechSupply</strong> — en attente</li>
                  <li>Inventaire <strong>Zone B</strong> — planifié 20 avr.</li>
                </ul>
                <div className="crm-prio-actions">
                  <button
                    type="button"
                    className="ca-btn"
                    onClick={() => onStockNavigate?.("alerts")}
                  >
                    Alertes
                  </button>
                  <button
                    type="button"
                    className="ca-btn primary"
                    onClick={() => onStockNavigate?.("catalog")}
                  >
                    Catalogue
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="card db-stub-card">
            <div className="card-head">
              <div>
                <div className="card-title">📦 Infinite Core — Stock Pro</div>
                <div className="card-sub">Module en extension</div>
              </div>
            </div>
            <div className="card-body db-stub">
              <div className="db-stub-ico">📦</div>
              <div className="db-stub-title">Bientôt complet</div>
              <div className="db-stub-desc">
                Articles multi-sites, bons de commande, réceptions et inventaires
                tournants.
              </div>
            </div>
          </div>
        </>
      ) : null}

      {section === "catalog" ? (
        <div className="card">
          <div className="card-head crm-accounts-toolbar-wrap">
            <div>
              <div className="card-title">📑 Catalogue articles</div>
              <div className="card-sub">SKU · FCFA</div>
            </div>
            <div className="card-actions fin-invoice-toolbar">
              <input
                type="search"
                className="fin-invoice-search"
                placeholder="Référence, libellé…"
                aria-label="Recherche catalogue"
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
              />
              <button
                type="button"
                className="ca-btn primary"
                onClick={() => {
                  pushToast("Redirection vers le formulaire noya partenaire…");
                  window.location.href = RECRUITMENT_URL;
                }}
              >
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
                  <th>PU</th>
                </tr>
              </thead>
              <tbody>
                {filteredCatalog.length === 0 ? (
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
                      Aucun article ne correspond à la recherche.
                    </td>
                  </tr>
                ) : (
                  filteredCatalog.map((r) => (
                    <tr key={r.ref}>
                      <td className="bold">{r.ref}</td>
                      <td>{r.label}</td>
                      <td>{r.category}</td>
                      <td>{r.qty}</td>
                      <td
                        style={{
                          fontFamily: "var(--font-dm-mono), monospace",
                          fontSize: 11,
                          color: "var(--gold)",
                        }}
                      >
                        {r.price}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {section === "orders" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">🧾 Bons de commande</div>
              <div className="card-sub">Fournisseurs</div>
            </div>
          </div>
          <div className="card-table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>N° BC</th>
                  <th>Fournisseur</th>
                  <th>Date</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bold">BC-2026-014</td>
                  <td>TechSupply CI</td>
                  <td>08 Avr</td>
                  <td
                    style={{
                      fontFamily: "var(--font-dm-mono), monospace",
                      color: "var(--gold)",
                    }}
                  >
                    185 000
                  </td>
                  <td>
                    <span className="badge y">En cours</span>
                  </td>
                </tr>
                <tr>
                  <td className="bold">BC-2026-011</td>
                  <td>Papeterie Sud</td>
                  <td>02 Avr</td>
                  <td
                    style={{
                      fontFamily: "var(--font-dm-mono), monospace",
                      color: "var(--gold)",
                    }}
                  >
                    42 000
                  </td>
                  <td>
                    <span className="badge g">Reçu</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {section === "alerts" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">🔔 Alertes stock bas</div>
              <div className="card-sub">Seuils & réapprovisionnement</div>
            </div>
          </div>
          <div className="card-body crm-prio-body">
            <ul className="crm-prio-list">
              <li>
                <strong>Toner HP</strong> — 6 restants · seuil 8 · fournisseur
                TechSupply
              </li>
              <li>
                <strong>Badges visiteurs</strong> — 12 · seuil 20
              </li>
              <li>
                <strong>Câbles RJ45</strong> — 9 · seuil 15
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function CommsPage({
  active,
  section,
  onCommsNavigate,
}: CommsPageProps) {
  return (
    <div className={`page${active ? " active" : ""}`} id="page-comms">
      <div className="kpi-row">
        <div className="kpi gold">
          <div className="kpi-label">Messages ce mois</div>
          <div className="kpi-val">312</div>
          <div className="kpi-delta neutral">● Clients & interne</div>
        </div>
        <div className="kpi green">
          <div className="kpi-label">Campagnes actives</div>
          <div className="kpi-val">2</div>
          <div className="kpi-delta up">▲ Newsletter + SMS</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-label">Taux d&apos;ouverture</div>
          <div className="kpi-val">41%</div>
          <div className="kpi-delta neutral">● Moy. 90 j.</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-label">Modèles</div>
          <div className="kpi-val">18</div>
          <div className="kpi-delta neutral">● Emails & SMS</div>
        </div>
      </div>

      {section === "overview" ? (
        <div className="grid-2">
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">✉ Synthèse canaux</div>
              </div>
            </div>
            <div className="card-body crm-prio-body">
              <ul className="crm-prio-list">
                <li>Boîte <strong>contact@noya.ci</strong> — 12 non lus</li>
                <li>Campagne <strong>Avril — PME</strong> — envoi 16 avr.</li>
                <li>Modèle <strong>Relance facture</strong> — mis à jour</li>
              </ul>
              <div className="crm-prio-actions">
                <button
                  type="button"
                  className="ca-btn"
                  onClick={() => onCommsNavigate?.("inbox")}
                >
                  Boîte
                </button>
                <button
                  type="button"
                  className="ca-btn primary"
                  onClick={() => onCommsNavigate?.("campaigns")}
                >
                  Campagnes
                </button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body db-stub">
              <div className="db-stub-ico">✉️</div>
              <div className="db-stub-title">Centre de communication</div>
              <div className="db-stub-desc">
                Emails transactionnels, SMS, newsletters et fils internes —
                module Infinite Core.
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {section === "inbox" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">📥 Boîte de réception</div>
            </div>
            <div className="card-actions">
              <button type="button" className="ca-btn primary">
                ＋ Nouveau message
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="activity">
              <div className="act-item">
                <span className="act-dot" style={{ color: "var(--gold)" }} />
                <div className="act-text">
                  <strong>contact@noya.ci</strong> — Demande devis Infinite Core
                  (Sté Kanga)
                </div>
                <div className="act-time">Auj.</div>
              </div>
              <div className="act-item">
                <span className="act-dot" style={{ color: "var(--cobalt2)" }} />
                <div className="act-text">
                  <strong>newsletter</strong> — 24 rebonds sur campagne Mars
                </div>
                <div className="act-time">Hier</div>
              </div>
              <div className="act-item">
                <span className="act-dot" style={{ color: "var(--green)" }} />
                <div className="act-text">
                  <strong>RH</strong> — Confirmation invitation atelier
                </div>
                <div className="act-time">02 Avr</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {section === "campaigns" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">📣 Campagnes</div>
              <div className="card-sub">Planification & stats</div>
            </div>
          </div>
          <div className="card-table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Canal</th>
                  <th>Envoi</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bold">PME — Avril 2026</td>
                  <td>
                    <span className="badge b">Email</span>
                  </td>
                  <td>16 Avr</td>
                  <td>
                    <span className="badge y">Planifié</span>
                  </td>
                </tr>
                <tr>
                  <td className="bold">Rappel Academy</td>
                  <td>
                    <span className="badge p">SMS</span>
                  </td>
                  <td>12 Avr</td>
                  <td>
                    <span className="badge g">Envoyé</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {section === "templates" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">📄 Modèles</div>
            </div>
          </div>
          <div className="card-body">
            <div className="fin-report-grid">
              <button type="button" className="fin-report-tile">
                <span className="fin-report-ico">✉️</span>
                <span className="fin-report-t">Bienvenue client</span>
                <span className="fin-report-d">Email HTML · marque Noya</span>
              </button>
              <button type="button" className="fin-report-tile">
                <span className="fin-report-ico">🧾</span>
                <span className="fin-report-t">Relance facture</span>
                <span className="fin-report-d">Court · pièce jointe</span>
              </button>
              <button type="button" className="fin-report-tile">
                <span className="fin-report-ico">📱</span>
                <span className="fin-report-t">SMS RDV</span>
                <span className="fin-report-d">160 caractères</span>
              </button>
              <button type="button" className="fin-report-tile">
                <span className="fin-report-ico">📰</span>
                <span className="fin-report-t">Newsletter mensuelle</span>
                <span className="fin-report-d">Bloc hero + articles</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AcademyPage({
  active,
  section,
  onAcademyNavigate,
}: AcademyPageProps) {
  const { globalSearch } = useDashboardUi();
  const [programQuery, setProgramQuery] = useState("");

  const filteredPrograms = useMemo(
    () =>
      filterAcademyPrograms(
        ACADEMY_PROGRAM_ROWS,
        section === "programs" ? programQuery : "",
        globalSearch,
      ),
    [section, programQuery, globalSearch],
  );

  return (
    <div className={`page${active ? " active" : ""}`} id="page-academy">
      <div className="kpi-row">
        <div className="kpi gold">
          <div className="kpi-label">Formations actives</div>
          <div className="kpi-val">6</div>
          <div className="kpi-delta neutral">● 3 en présentiel</div>
        </div>
        <div className="kpi green">
          <div className="kpi-label">Apprenants ce mois</div>
          <div className="kpi-val">84</div>
          <div className="kpi-delta up">▲ +18%</div>
        </div>
        <div className="kpi blue">
          <div className="kpi-label">Taux complétion</div>
          <div className="kpi-val">79%</div>
          <div className="kpi-delta up">▲ +6 pts</div>
        </div>
        <div className="kpi purple">
          <div className="kpi-label">Revenus Academy</div>
          <div className="kpi-val">1.8M</div>
          <div className="kpi-delta up">▲ ce mois</div>
        </div>
      </div>

      {section === "overview" ? (
        <>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">🎓 Programmes en vedette</div>
                <div className="card-sub">Aperçu</div>
              </div>
              <div className="card-actions">
                <button
                  type="button"
                  className="ca-btn primary"
                  onClick={() => onAcademyNavigate?.("programs")}
                >
                  Tous les programmes
                </button>
              </div>
            </div>
            <div className="card-table-wrap">
              <AcademyProgramsTable rows={filteredPrograms.slice(0, 2)} />
            </div>
          </div>
        </>
      ) : null}

      {section === "programs" ? (
        <div className="card">
          <div className="card-head crm-accounts-toolbar-wrap">
            <div>
              <div className="card-title">🎓 Noya Academy · Programmes</div>
            </div>
            <div className="card-actions fin-invoice-toolbar">
              <input
                type="search"
                className="fin-invoice-search"
                placeholder="Programme, type, session…"
                aria-label="Filtrer les programmes"
                value={programQuery}
                onChange={(e) => setProgramQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="card-table-wrap">
            <AcademyProgramsTable rows={filteredPrograms} />
          </div>
        </div>
      ) : null}

      {section === "learners" ? (
        <div className="grid-2">
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">👤 Segments</div>
              </div>
            </div>
            <div className="card-body">
              <div className="mini-grid crm-overview-mini">
                <div className="mini-stat">
                  <div className="mini-val" style={{ color: "var(--gold)" }}>
                    84
                  </div>
                  <div className="mini-lbl">Ce mois</div>
                </div>
                <div className="mini-stat">
                  <div className="mini-val" style={{ color: "var(--green)" }}>
                    79%
                  </div>
                  <div className="mini-lbl">Complétion</div>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title">📋 Cohortes récentes</div>
              </div>
            </div>
            <div className="card-body fin-treasury-list">
              <ul>
                <li>
                  <strong>Mktg Digital</strong> — 24 inscrits · session 14 avr.
                </li>
                <li>
                  <strong>Gestion PME</strong> — 38 en ligne · continu
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {section === "calendar" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">📅 Calendrier sessions</div>
              <div className="card-sub">Présentiel & hybride</div>
            </div>
          </div>
          <div className="card-body crm-rdv-list">
            <ul>
              <li>
                <span className="crm-rdv-date">14 avr.</span>
                <span className="crm-rdv-body">
                  <strong>Marketing Digital</strong> — Plateau · 09h-17h
                </span>
              </li>
              <li>
                <span className="crm-rdv-date">19 avr.</span>
                <span className="crm-rdv-body">
                  <strong>Leadership</strong> — Cocody · groupe 12
                </span>
              </li>
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SettingsPage({
  active,
  section,
  onSettingsNavigate,
}: SettingsPageProps) {
  return (
    <div className={`page${active ? " active" : ""}`} id="page-settings">
      {section === "overview" ? (
        <div className="grid-2">
          <button
            type="button"
            className="fin-report-tile"
            onClick={() => onSettingsNavigate?.("account")}
          >
            <span className="fin-report-ico">👤</span>
            <span className="fin-report-t">Compte & profil</span>
            <span className="fin-report-d">Identité, logo, coordonnées</span>
          </button>
          <button
            type="button"
            className="fin-report-tile"
            onClick={() => onSettingsNavigate?.("security")}
          >
            <span className="fin-report-ico">🔐</span>
            <span className="fin-report-t">Sécurité</span>
            <span className="fin-report-d">2FA, sessions, mots de passe</span>
          </button>
          <button
            type="button"
            className="fin-report-tile"
            onClick={() => onSettingsNavigate?.("integrations")}
          >
            <span className="fin-report-ico">🔌</span>
            <span className="fin-report-t">Intégrations</span>
            <span className="fin-report-d">API, webhooks, outils tiers</span>
          </button>
          <div className="card">
            <div className="card-body db-stub">
              <div className="db-stub-ico">⚙️</div>
              <div className="db-stub-title">Infinite Core</div>
              <div className="db-stub-desc">
                Espace Noya Industries · paramètres avancés et rôles à venir.
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {section === "account" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">👤 Compte</div>
              <div className="card-sub">Profil organisation</div>
            </div>
          </div>
          <div className="card-body db-stub">
            <div className="db-stub-title">Profil & branding</div>
            <div className="db-stub-desc">
              Logo, raison sociale, mentions légales et coordonnées de facturation.
            </div>
          </div>
        </div>
      ) : null}

      {section === "security" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">🔐 Sécurité</div>
            </div>
          </div>
          <div className="card-body">
            <ul className="crm-prio-list">
              <li>
                Authentification à deux facteurs —{" "}
                <span className="badge g">Recommandé</span>
              </li>
              <li>Sessions actives — 3 appareils</li>
              <li>Journal d&apos;audit — rétention 90 j.</li>
            </ul>
          </div>
        </div>
      ) : null}

      {section === "integrations" ? (
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">🔌 Intégrations</div>
            </div>
          </div>
          <div className="card-table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Portée</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bold">Google Workspace</td>
                  <td>Email, agenda</td>
                  <td>
                    <span className="badge g">Connecté</span>
                  </td>
                </tr>
                <tr>
                  <td className="bold">Slack</td>
                  <td>Notifications projets</td>
                  <td>
                    <span className="badge y">Configuration</span>
                  </td>
                </tr>
                <tr>
                  <td className="bold">Webhook facturation</td>
                  <td>Finance → ERP</td>
                  <td>
                    <span className="badge b">Brouillon</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}

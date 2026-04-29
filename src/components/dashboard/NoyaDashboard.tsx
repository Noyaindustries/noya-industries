"use client";

import {
  ACADEMY_NAV,
  ACADEMY_SECTION_LABELS,
  type AcademySectionId,
} from "@/lib/dashboard/academyNav";
import {
  COMMS_NAV,
  COMMS_SECTION_LABELS,
  type CommsSectionId,
} from "@/lib/dashboard/commsNav";
import {
  CRM_NAV,
  CRM_SECTION_LABELS,
  type CrmSectionId,
} from "@/lib/dashboard/crmNav";
import {
  FINANCE_NAV,
  FINANCE_SECTION_LABELS,
  type FinanceSectionId,
} from "@/lib/dashboard/financeNav";
import {
  HR_NAV,
  HR_SECTION_LABELS,
  type HrSectionId,
} from "@/lib/dashboard/hrNav";
import {
  PROJECTS_NAV,
  PROJECTS_SECTION_LABELS,
  type ProjectsSectionId,
} from "@/lib/dashboard/projectsNav";
import {
  SETTINGS_NAV,
  SETTINGS_SECTION_LABELS,
  type SettingsSectionId,
} from "@/lib/dashboard/settingsNav";
import {
  STOCK_NAV,
  STOCK_SECTION_LABELS,
  type StockSectionId,
} from "@/lib/dashboard/stockNav";
import {
  readDashboardSections,
  resolveStoredSection,
  writeDashboardSections,
} from "@/lib/dashboard/dashboardSectionsStorage";
import { DASHBOARD_PAGE_TITLES } from "@/lib/dashboard/pageTitles";
import type { DashboardPageId } from "@/lib/dashboard/types";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LANDING_IMG } from "../landing/landingAssets";
import { useDashboardUi } from "./dashboardUiContext";
import type { DashboardAlert } from "./dashboardAlerts";
import { CrmPage } from "./pages/CrmPage";
import { FinancePage } from "./pages/FinancePage";
import { HrPage } from "./pages/HrPage";
import { OverviewPage } from "./pages/OverviewPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import {
  AcademyPage,
  CommsPage,
  SettingsPage,
  StockPage,
} from "./pages/StubPages";

const INITIAL_ALERTS: DashboardAlert[] = [
  {
    id: "a1",
    kind: "warn",
    icon: "⚠️",
    content: (
      <>
        <strong>Facture N°2024-047</strong> — Cabinet Diomandé · Échéance
        dépassée de 3 jours · 450 000 FCFA
      </>
    ),
  },
  {
    id: "a2",
    kind: "err",
    icon: "🔴",
    content: (
      <>
        <strong>Projet PRESENZ-012</strong> — Groupe Ouattara · Délai de
        livraison dépassé · Action requise
      </>
    ),
  },
  {
    id: "a3",
    kind: "info",
    icon: "📋",
    content: (
      <>
        <strong>Audit Business</strong> — Ets Koffi & Frères · Rapport à
        valider avant vendredi
      </>
    ),
  },
  {
    id: "a4",
    kind: "suc",
    icon: "✅",
    content: (
      <>
        <strong>Paiement reçu</strong> — Sté Coulibaly · 280 000 FCFA crédités
        aujourd&apos;hui
      </>
    ),
  },
];

type NavItem = {
  id: DashboardPageId;
  icon: string;
  label: string;
  badge?: { n: string; green?: boolean };
};

const NAV_GROUPS: { section: string; items: NavItem[] }[] = [
  {
    section: "Principal",
    items: [
      { id: "overview", icon: "📊", label: "Vue d'ensemble" },
      { id: "finance", icon: "💰", label: "Finance" },
      { id: "crm", icon: "👥", label: "CRM & Clients", badge: { n: "12", green: true } },
      { id: "projects", icon: "📋", label: "Projets", badge: { n: "3" } },
    ],
  },
  {
    section: "Ressources",
    items: [
      { id: "hr", icon: "🏢", label: "RH & Équipe" },
      { id: "stock", icon: "📦", label: "Stock & Achats" },
      { id: "comms", icon: "✉️", label: "Communications", badge: { n: "5" } },
    ],
  },
  {
    section: "Outils",
    items: [
      { id: "academy", icon: "🎓", label: "Academy" },
      { id: "settings", icon: "⚙️", label: "Paramètres" },
    ],
  },
];

type ModalTile = {
  bg: string;
  bgHover: string;
  border: string;
  icon: string;
  title: string;
  desc: string;
  action?: {
    page: DashboardPageId;
    toast: string;
    redirectToRecruitment?: boolean;
    finance?: FinanceSectionId;
    crm?: CrmSectionId;
    projects?: ProjectsSectionId;
    hr?: HrSectionId;
    stock?: StockSectionId;
    comms?: CommsSectionId;
    academy?: AcademySectionId;
    settings?: SettingsSectionId;
  };
};

const MODAL_TILES: ModalTile[] = [
  {
    bg: "var(--gold-dim)",
    bgHover: "rgba(245,166,35,.18)",
    border: "var(--gold-border)",
    icon: "📁",
    title: "Nouvelle mission",
    desc: "Créer un projet client",
    action: {
      page: "projects",
      toast: "Redirection vers le formulaire noya partenaire…",
      redirectToRecruitment: true,
      projects: "portfolio",
    },
  },
  {
    bg: "var(--cobalt-dim)",
    bgHover: "rgba(36,96,167,.18)",
    border: "var(--cobalt-border)",
    icon: "🧾",
    title: "Nouvelle facture",
    desc: "Générer et envoyer",
    action: {
      page: "finance",
      toast: "Redirection vers le formulaire noya partenaire…",
      redirectToRecruitment: true,
      finance: "invoices",
    },
  },
  {
    bg: "var(--green-dim)",
    bgHover: "rgba(16,185,129,.18)",
    border: "var(--green-border)",
    icon: "👥",
    title: "Nouveau client",
    desc: "Ajouter au CRM",
    action: {
      page: "crm",
      toast: "Redirection vers le formulaire noya partenaire…",
      redirectToRecruitment: true,
      crm: "accounts",
    },
  },
  {
    bg: "var(--purple-dim)",
    bgHover: "rgba(139,92,246,.18)",
    border: "var(--purple-border)",
    icon: "📅",
    title: "Planifier RDV",
    desc: "Agenda & Rappels",
    action: {
      page: "crm",
      toast: "Redirection vers le formulaire noya partenaire…",
      redirectToRecruitment: true,
      crm: "activities",
    },
  },
];

const RECRUITMENT_URL =
  process.env.NEXT_PUBLIC_NOYA_RECRUTEMENT_URL ?? "/recrutement#travailler-avec-nous";

export function NoyaDashboard() {
  const { globalSearch, setGlobalSearch, pushToast } = useDashboardUi();
  const [page, setPage] = useState<DashboardPageId>("overview");
  // Sections initiales fixes (SSR + 1er rendu client) pour éviter les écarts
  // d’hydratation : localStorage n’est relu qu’après montage.
  const [financeSection, setFinanceSection] =
    useState<FinanceSectionId>("overview");
  const [crmSection, setCrmSection] = useState<CrmSectionId>("overview");
  const [projectsSection, setProjectsSection] =
    useState<ProjectsSectionId>("overview");
  const [hrSection, setHrSection] = useState<HrSectionId>("overview");
  const [stockSection, setStockSection] = useState<StockSectionId>("overview");
  const [commsSection, setCommsSection] = useState<CommsSectionId>("overview");
  const [academySection, setAcademySection] =
    useState<AcademySectionId>("overview");
  const [settingsSection, setSettingsSection] =
    useState<SettingsSectionId>("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [alerts, setAlerts] = useState<DashboardAlert[]>(INITIAL_ALERTS);
  const [dateStr, setDateStr] = useState("");
  const skipSectionPersist = useRef(true);

  useEffect(() => {
    queueMicrotask(() => {
      const d = new Date();
      setDateStr(
        d.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      );
    });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setFinanceSection(
        resolveStoredSection(
          "finance",
          "overview",
          FINANCE_NAV.map((x) => x.id),
        ),
      );
      setCrmSection(
        resolveStoredSection("crm", "overview", CRM_NAV.map((x) => x.id)),
      );
      setProjectsSection(
        resolveStoredSection(
          "projects",
          "overview",
          PROJECTS_NAV.map((x) => x.id),
        ),
      );
      setHrSection(
        resolveStoredSection("hr", "overview", HR_NAV.map((x) => x.id)),
      );
      setStockSection(
        resolveStoredSection("stock", "overview", STOCK_NAV.map((x) => x.id)),
      );
      setCommsSection(
        resolveStoredSection("comms", "overview", COMMS_NAV.map((x) => x.id)),
      );
      setAcademySection(
        resolveStoredSection(
          "academy",
          "overview",
          ACADEMY_NAV.map((x) => x.id),
        ),
      );
      setSettingsSection(
        resolveStoredSection(
          "settings",
          "overview",
          SETTINGS_NAV.map((x) => x.id),
        ),
      );
    });
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  useEffect(() => {
    // Le 1er passage voit encore les valeurs SSR ; on attend le rendu après restauration localStorage.
    if (skipSectionPersist.current) {
      skipSectionPersist.current = false;
      return;
    }
    writeDashboardSections({
      ...readDashboardSections(),
      finance: financeSection,
      crm: crmSection,
      projects: projectsSection,
      hr: hrSection,
      stock: stockSection,
      comms: commsSection,
      academy: academySection,
      settings: settingsSection,
    });
  }, [
    financeSection,
    crmSection,
    projectsSection,
    hrSection,
    stockSection,
    commsSection,
    academySection,
    settingsSection,
  ]);

  const applyModalTile = useCallback(
    (tile: ModalTile) => {
      const a = tile.action;
      if (!a) return;
      setPage(a.page);
      if (a.finance !== undefined) setFinanceSection(a.finance);
      if (a.crm !== undefined) setCrmSection(a.crm);
      if (a.projects !== undefined) setProjectsSection(a.projects);
      if (a.hr !== undefined) setHrSection(a.hr);
      if (a.stock !== undefined) setStockSection(a.stock);
      if (a.comms !== undefined) setCommsSection(a.comms);
      if (a.academy !== undefined) setAcademySection(a.academy);
      if (a.settings !== undefined) setSettingsSection(a.settings);
      pushToast(a.toast);
      if (a.redirectToRecruitment) {
        window.location.href = RECRUITMENT_URL;
      }
    },
    [pushToast],
  );

  const title = useMemo(() => {
    if (page === "finance") {
      const sub = FINANCE_SECTION_LABELS[financeSection];
      return `${DASHBOARD_PAGE_TITLES.finance} — ${sub}`;
    }
    if (page === "crm") {
      const sub = CRM_SECTION_LABELS[crmSection];
      return `${DASHBOARD_PAGE_TITLES.crm} — ${sub}`;
    }
    if (page === "projects") {
      const sub = PROJECTS_SECTION_LABELS[projectsSection];
      return `${DASHBOARD_PAGE_TITLES.projects} — ${sub}`;
    }
    if (page === "hr") {
      const sub = HR_SECTION_LABELS[hrSection];
      return `${DASHBOARD_PAGE_TITLES.hr} — ${sub}`;
    }
    if (page === "stock") {
      const sub = STOCK_SECTION_LABELS[stockSection];
      return `${DASHBOARD_PAGE_TITLES.stock} — ${sub}`;
    }
    if (page === "comms") {
      const sub = COMMS_SECTION_LABELS[commsSection];
      return `${DASHBOARD_PAGE_TITLES.comms} — ${sub}`;
    }
    if (page === "academy") {
      const sub = ACADEMY_SECTION_LABELS[academySection];
      return `${DASHBOARD_PAGE_TITLES.academy} — ${sub}`;
    }
    if (page === "settings") {
      const sub = SETTINGS_SECTION_LABELS[settingsSection];
      return `${DASHBOARD_PAGE_TITLES.settings} — ${sub}`;
    }
    return DASHBOARD_PAGE_TITLES[page];
  }, [
    page,
    financeSection,
    crmSection,
    projectsSection,
    hrSection,
    stockSection,
    commsSection,
    academySection,
    settingsSection,
  ]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((a) => a.filter((x) => x.id !== id));
  }, []);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  return (
    <>
      <nav
        className="sidebar"
        aria-label="Navigation principale"
        onMouseMove={(e) => {
          const t = e.target as HTMLElement;
          const item = t.closest(".sb-item");
          if (!(item instanceof HTMLElement)) return;
          const r = item.getBoundingClientRect();
          item.style.setProperty(
            "--mx",
            `${((e.clientX - r.left) / r.width) * 100}%`,
          );
          item.style.setProperty(
            "--my",
            `${((e.clientY - r.top) / r.height) * 100}%`,
          );
        }}
      >
        <Link href="/" className="sb-logo" title="Retour au site">
          <Image
            src={LANDING_IMG.brandMark}
            alt="Noya Industries"
            width={120}
            height={28}
            style={{ height: 22, width: "auto" }}
          />
        </Link>
        <div className="sb-tag">Infinite Core · v2.1</div>

        <div className="sb-scroll">
          {NAV_GROUPS.map((g) => (
            <div key={g.section}>
              <div className="sb-section">{g.section}</div>
              {g.items.map((item) => (
                <div key={item.id} className="sb-item-cluster">
                  <button
                    type="button"
                    className={`sb-item${page === item.id ? " active" : ""}`}
                    onClick={() => {
                      setPage(item.id);
                      if (item.id === "finance") {
                        setFinanceSection("overview");
                      }
                      if (item.id === "crm") {
                        setCrmSection("overview");
                      }
                      if (item.id === "projects") {
                        setProjectsSection("overview");
                      }
                      if (item.id === "hr") {
                        setHrSection("overview");
                      }
                      if (item.id === "stock") {
                        setStockSection("overview");
                      }
                      if (item.id === "comms") {
                        setCommsSection("overview");
                      }
                      if (item.id === "academy") {
                        setAcademySection("overview");
                      }
                      if (item.id === "settings") {
                        setSettingsSection("overview");
                      }
                    }}
                  >
                    <div className="sb-icon">{item.icon}</div>
                    {item.label}
                    {item.badge ? (
                      <span
                        className={`sb-badge${item.badge.green ? " green" : ""}`}
                      >
                        {item.badge.n}
                      </span>
                    ) : null}
                  </button>
                  {item.id === "finance" && page === "finance" ? (
                    <div
                      className="sb-subnav"
                      role="tablist"
                      aria-label="Sections Finance"
                    >
                      {FINANCE_NAV.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          role="tab"
                          aria-selected={financeSection === s.id}
                          className={`sb-sub-item${financeSection === s.id ? " active" : ""}`}
                          onClick={() => {
                            setPage("finance");
                            setFinanceSection(s.id);
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {item.id === "crm" && page === "crm" ? (
                    <div
                      className="sb-subnav sb-subnav-crm"
                      role="tablist"
                      aria-label="Sections CRM"
                    >
                      {CRM_NAV.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          role="tab"
                          aria-selected={crmSection === s.id}
                          className={`sb-sub-item${crmSection === s.id ? " active" : ""}`}
                          onClick={() => {
                            setPage("crm");
                            setCrmSection(s.id);
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {item.id === "projects" && page === "projects" ? (
                    <div
                      className="sb-subnav sb-subnav-projects"
                      role="tablist"
                      aria-label="Sections Projets"
                    >
                      {PROJECTS_NAV.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          role="tab"
                          aria-selected={projectsSection === s.id}
                          className={`sb-sub-item${projectsSection === s.id ? " active" : ""}`}
                          onClick={() => {
                            setPage("projects");
                            setProjectsSection(s.id);
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {item.id === "hr" && page === "hr" ? (
                    <div
                      className="sb-subnav sb-subnav-hr"
                      role="tablist"
                      aria-label="Sections RH"
                    >
                      {HR_NAV.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          role="tab"
                          aria-selected={hrSection === s.id}
                          className={`sb-sub-item${hrSection === s.id ? " active" : ""}`}
                          onClick={() => {
                            setPage("hr");
                            setHrSection(s.id);
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {item.id === "stock" && page === "stock" ? (
                    <div
                      className="sb-subnav sb-subnav-stock"
                      role="tablist"
                      aria-label="Sections Stock"
                    >
                      {STOCK_NAV.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          role="tab"
                          aria-selected={stockSection === s.id}
                          className={`sb-sub-item${stockSection === s.id ? " active" : ""}`}
                          onClick={() => {
                            setPage("stock");
                            setStockSection(s.id);
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {item.id === "comms" && page === "comms" ? (
                    <div
                      className="sb-subnav sb-subnav-comms"
                      role="tablist"
                      aria-label="Sections Communications"
                    >
                      {COMMS_NAV.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          role="tab"
                          aria-selected={commsSection === s.id}
                          className={`sb-sub-item${commsSection === s.id ? " active" : ""}`}
                          onClick={() => {
                            setPage("comms");
                            setCommsSection(s.id);
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {item.id === "academy" && page === "academy" ? (
                    <div
                      className="sb-subnav sb-subnav-academy"
                      role="tablist"
                      aria-label="Sections Academy"
                    >
                      {ACADEMY_NAV.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          role="tab"
                          aria-selected={academySection === s.id}
                          className={`sb-sub-item${academySection === s.id ? " active" : ""}`}
                          onClick={() => {
                            setPage("academy");
                            setAcademySection(s.id);
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {item.id === "settings" && page === "settings" ? (
                    <div
                      className="sb-subnav sb-subnav-settings"
                      role="tablist"
                      aria-label="Sections Paramètres"
                    >
                      {SETTINGS_NAV.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          role="tab"
                          aria-selected={settingsSection === s.id}
                          className={`sb-sub-item${settingsSection === s.id ? " active" : ""}`}
                          onClick={() => {
                            setPage("settings");
                            setSettingsSection(s.id);
                          }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="sb-bottom">
          <div className="sb-user">
            <div className="sb-av">YN</div>
            <div>
              <div className="sb-uname">Yannick N&apos;guessan</div>
              <div className="sb-urole">Directeur Général</div>
            </div>
          </div>
        </div>
      </nav>

      <div className="main">
        <header className="topbar">
          <div className="tb-left">
            <h1 className="tb-title">{title}</h1>
            <div className="tb-date">{dateStr}</div>
          </div>
          <div className="tb-right">
            <input
              className="tb-search"
              type="search"
              placeholder="🔍  Rechercher..."
              aria-label="Rechercher dans la page active"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
            <button
              type="button"
              className="tb-btn"
              title="Notifications"
              onClick={() =>
                pushToast("3 notifications (démo) — centre à venir")
              }
            >
              🔔
              <span className="tb-notif" />
            </button>
            <button
              type="button"
              className="tb-btn"
              title="Exporter"
              onClick={() =>
                pushToast("Export CSV / PDF (démo) — préparation…")
              }
            >
              📤
            </button>
            <button
              type="button"
              className="tb-new"
              onClick={() => setModalOpen(true)}
            >
              ＋ Nouveau
            </button>
          </div>
        </header>

        <div className="content">
          <OverviewPage
            active={page === "overview"}
            alerts={alerts}
            onRemoveAlert={removeAlert}
            onClearAlerts={clearAlerts}
          />
          <FinancePage
            active={page === "finance"}
            section={financeSection}
            onFinanceNavigate={(s) => {
              setPage("finance");
              setFinanceSection(s);
            }}
          />
          <CrmPage
            active={page === "crm"}
            section={crmSection}
            onCrmNavigate={(s) => {
              setPage("crm");
              setCrmSection(s);
            }}
          />
          <ProjectsPage
            active={page === "projects"}
            section={projectsSection}
            onProjectsNavigate={(s) => {
              setPage("projects");
              setProjectsSection(s);
            }}
          />
          <HrPage
            active={page === "hr"}
            section={hrSection}
            onHrNavigate={(s) => {
              setPage("hr");
              setHrSection(s);
            }}
          />
          <StockPage
            active={page === "stock"}
            section={stockSection}
            onStockNavigate={(s) => {
              setPage("stock");
              setStockSection(s);
            }}
          />
          <CommsPage
            active={page === "comms"}
            section={commsSection}
            onCommsNavigate={(s) => {
              setPage("comms");
              setCommsSection(s);
            }}
          />
          <AcademyPage
            active={page === "academy"}
            section={academySection}
            onAcademyNavigate={(s) => {
              setPage("academy");
              setAcademySection(s);
            }}
          />
          <SettingsPage
            active={page === "settings"}
            section={settingsSection}
            onSettingsNavigate={(s) => {
              setPage("settings");
              setSettingsSection(s);
            }}
          />
        </div>
      </div>

      <div
        className={`db-modal-overlay${modalOpen ? " open" : ""}`}
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalOpen(false);
        }}
      >
        <div
          className="db-modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="db-modal-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="db-modal-topbar" />
          <div id="db-modal-title" className="db-modal-title">
            Nouvelle action
          </div>
          <div className="db-modal-sub">Choisir le type de création</div>
          <div className="db-modal-grid">
            {MODAL_TILES.map((t) => (
              <ModalTileButton
                key={t.title}
                tile={t}
                onPick={() => {
                  setModalOpen(false);
                  applyModalTile(t);
                }}
              />
            ))}
          </div>
          <div className="db-modal-cancel">
            <button type="button" onClick={() => setModalOpen(false)}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ModalTileButton({
  tile,
  onPick,
}: {
  tile: ModalTile;
  onPick: () => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      className="db-modal-tile"
      onClick={onPick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? tile.bgHover : tile.bg,
        borderColor: tile.border,
        boxShadow: hover
          ? "0 12px 32px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.06)"
          : "0 4px 16px rgba(0,0,0,.2)",
        transform: hover ? "translateY(-2px)" : "none",
      }}
    >
      <div className="db-modal-tile-ico">{tile.icon}</div>
      <div className="db-modal-tile-t">{tile.title}</div>
      <div className="db-modal-tile-d">{tile.desc}</div>
    </button>
  );
}

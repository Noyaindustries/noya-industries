import { formatFcfa } from "./module-fallbacks";
import {
  getAcademyData,
  getCommsData,
  getCrmData,
  getFinanceData,
  getHrLeavesData,
  getProjectsData,
  getStockData,
} from "./module-store";

export type OverviewAlertDto = {
  id: string;
  kind: "warn" | "err" | "info" | "suc";
  icon: string;
  title: string;
  detail: string;
};

export type OverviewMissionDto = {
  initials: string;
  client: string;
  avBg: string;
  avColor?: string | null;
  mission: string;
  pole: "consulting" | "tech" | "academy";
  status: "livré" | "en_cours" | "jalon" | "retard" | "devis" | "planifié";
  amount: string;
  amountMuted?: boolean;
};

export type OverviewActivityDto = {
  dotColor: string;
  title: string;
  detail: string;
  time: string;
};

export type OverviewKpis = {
  revenueMonthFcfa: number;
  revenueMonthDelta: string;
  activeClients: number;
  clientsDelta: string;
  activeProjects: number;
  projectsLate: number;
  unpaidInvoices: number;
  invoicesLate: number;
};

export type OverviewPoleRevenue = {
  key: string;
  label: string;
  amountFcfa: number;
  pct: number;
  color: string;
  colorSoft: string;
};

export type OverviewData = {
  kpis: OverviewKpis;
  alerts: OverviewAlertDto[];
  missions: OverviewMissionDto[];
  activities: OverviewActivityDto[];
  revenueHistory: { label: string; value: number }[];
  poles: OverviewPoleRevenue[];
  totalRevenueFcfa: number;
};

const POLE_META: Record<
  string,
  { label: string; color: string; colorSoft: string }
> = {
  consulting: { label: "Consulting", color: "#e8b84a", colorSoft: "#fff4d6" },
  tech: { label: "Tech & SaaS", color: "#4a8ee8", colorSoft: "#dbeafe" },
  academy: { label: "Academy", color: "#34d399", colorSoft: "#d1fae5" },
  startup: { label: "Startup Studio", color: "#a78bfa", colorSoft: "#ede9fe" },
};

const REVENUE_MONTHS = ["Nov", "Déc", "Jan", "Fév", "Mar", "Avr"];
const REVENUE_SHAPE = [0.72, 0.91, 0.84, 1.12, 1.06, 1.24];

function abbrevFcfa(amount: number): string {
  if (amount <= 0) return "—";
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}K`;
  return formatFcfa(amount);
}

function mapProjectStatus(
  status: string,
): OverviewMissionDto["status"] {
  if (status === "livre") return "livré";
  if (status === "retard") return "retard";
  if (status === "avance") return "jalon";
  if (status === "devis") return "devis";
  if (status === "planifie") return "planifié";
  return "en_cours";
}

function normalizePole(pole: string): OverviewMissionDto["pole"] {
  if (pole === "tech" || pole === "academy") return pole;
  return "consulting";
}

function buildRevenueHistory(totalPaid: number) {
  const shapeSum = REVENUE_SHAPE.reduce((s, v) => s + v, 0);
  return REVENUE_MONTHS.map((label, i) => ({
    label,
    value: Math.round((totalPaid * REVENUE_SHAPE[i]) / shapeSum),
  }));
}

export async function getOverviewData(): Promise<OverviewData> {
  const [crm, finance, projects, stock, comms, academy, hr] = await Promise.all([
    getCrmData(),
    getFinanceData(),
    getProjectsData(),
    getStockData(),
    getCommsData(),
    getAcademyData(),
    getHrLeavesData(),
  ]);

  const clientPole = new Map(
    crm.clients.map((c) => [c.name.toLowerCase(), normalizePole(c.pole)]),
  );
  const invoiceByMission = new Map(
    finance.invoices.map((inv) => [inv.mission.toLowerCase(), inv]),
  );
  const invoiceByClient = new Map(
    finance.invoices.map((inv) => [inv.client.toLowerCase(), inv]),
  );

  const paidInvoices = finance.invoices.filter((i) => i.status === "payé");
  const revenueMonthFcfa = paidInvoices.reduce((s, i) => s + i.amount, 0);
  const partialRevenue = finance.invoices
    .filter((i) => i.status === "partiel")
    .reduce((s, i) => s + Math.round(i.amount * 0.5), 0);
  const monthRevenue = revenueMonthFcfa + partialRevenue;

  const activeClients = crm.clients.filter((c) => c.status === "actif").length;
  const newClients = crm.clients.filter((c) =>
    c.contactDate.includes("Avr"),
  ).length;
  const activeProjects = projects.projects.filter((p) => p.status !== "livre").length;
  const projectsLate = projects.projects.filter((p) => p.status === "retard").length;
  const unpaidInvoices = finance.invoices.filter((i) =>
    ["attente", "partiel"].includes(i.status),
  ).length;
  const invoicesLate = finance.invoices.filter((i) => i.status === "retard").length;

  const poleTotals = new Map<string, number>();
  for (const client of crm.clients) {
    const key = client.pole in POLE_META ? client.pole : "consulting";
    poleTotals.set(key, (poleTotals.get(key) ?? 0) + client.value);
  }
  if (poleTotals.size === 0) {
    poleTotals.set("consulting", monthRevenue);
  }
  const totalRevenueFcfa = [...poleTotals.values()].reduce((s, v) => s + v, 0) || monthRevenue;
  const poles: OverviewPoleRevenue[] = [...poleTotals.entries()]
    .map(([key, amountFcfa]) => {
      const meta = POLE_META[key] ?? POLE_META.consulting;
      return {
        key,
        label: meta.label,
        amountFcfa,
        pct: totalRevenueFcfa > 0 ? Math.round((amountFcfa / totalRevenueFcfa) * 100) : 0,
        color: meta.color,
        colorSoft: meta.colorSoft,
      };
    })
    .sort((a, b) => b.amountFcfa - a.amountFcfa);

  const missions: OverviewMissionDto[] = projects.projects.slice(0, 8).map((p) => {
    const inv =
      invoiceByMission.get(p.name.toLowerCase()) ??
      invoiceByClient.get(p.client.toLowerCase());
    const pole = clientPole.get(p.client.toLowerCase()) ?? "consulting";
    return {
      initials: p.ownerInitials,
      client: p.client,
      avBg: p.ownerBg,
      avColor: p.ownerColor,
      mission: p.name,
      pole,
      status: mapProjectStatus(p.status),
      amount: inv ? abbrevFcfa(inv.amount) : "—",
      amountMuted: !inv,
    };
  });

  const alerts: OverviewAlertDto[] = [];

  for (const inv of finance.invoices.filter((i) => i.status === "retard")) {
    alerts.push({
      id: `inv-late-${inv.number}`,
      kind: "warn",
      icon: "⚠️",
      title: `Facture ${inv.number}`,
      detail: `${inv.client} · Échéance dépassée · ${formatFcfa(inv.amount)} FCFA`,
    });
  }
  for (const proj of projects.projects.filter((p) => p.status === "retard")) {
    alerts.push({
      id: `proj-late-${proj.slug}`,
      kind: "err",
      icon: "🔴",
      title: proj.name,
      detail: `${proj.client} · Délai dépassé · Action requise`,
    });
  }
  for (const act of crm.activities.filter((a) => a.status === "pending").slice(0, 2)) {
    alerts.push({
      id: `crm-act-${act.title}`,
      kind: "info",
      icon: "📋",
      title: act.title,
      detail: `${act.clientName} · ${act.dateLabel}`,
    });
  }
  for (const item of stock.items.filter((i) => i.quantity <= i.minQuantity)) {
    alerts.push({
      id: `stock-low-${item.ref}`,
      kind: "warn",
      icon: "📦",
      title: `Stock bas — ${item.label}`,
      detail: `${item.quantity} restant(s) · seuil ${item.minQuantity}`,
    });
  }
  for (const msg of comms.messages.filter((m) => m.status === "new").slice(0, 2)) {
    alerts.push({
      id: `msg-${msg.id}`,
      kind: "info",
      icon: "✉️",
      title: "Nouveau message contact",
      detail: `${msg.name} · ${msg.topic ?? "Demande générale"}`,
    });
  }
  for (const inv of paidInvoices.slice(0, 2)) {
    alerts.push({
      id: `inv-paid-${inv.number}`,
      kind: "suc",
      icon: "✅",
      title: "Paiement reçu",
      detail: `${inv.client} · ${formatFcfa(inv.amount)} FCFA`,
    });
  }
  for (const leave of hr.leaves.filter((l) => l.status === "pending").slice(0, 1)) {
    alerts.push({
      id: `leave-${leave.employeeName}`,
      kind: "info",
      icon: "🏖️",
      title: "Congé en attente",
      detail: `${leave.employeeName} · ${leave.periodLabel}`,
    });
  }

  const activities: OverviewActivityDto[] = [];

  for (const inv of paidInvoices.slice(0, 2)) {
    activities.push({
      dotColor: "var(--green)",
      title: "Paiement reçu",
      detail: `${inv.client} · ${formatFcfa(inv.amount)} FCFA`,
      time: inv.dateLabel,
    });
  }
  for (const client of crm.clients.slice(0, 2)) {
    activities.push({
      dotColor: "var(--gold)",
      title: "Client CRM",
      detail: `${client.name} · ${client.sector}`,
      time: client.contactDate,
    });
  }
  for (const act of crm.activities.slice(0, 2)) {
    const color =
      act.status === "done"
        ? "var(--green)"
        : act.status === "pending"
          ? "var(--red)"
          : "var(--cobalt3)";
    activities.push({
      dotColor: color,
      title: act.title,
      detail: act.clientName,
      time: act.dateLabel,
    });
  }
  for (const proj of projects.projects.filter((p) => p.status === "retard").slice(0, 1)) {
    activities.push({
      dotColor: "var(--red)",
      title: "Retard signalé",
      detail: proj.name,
      time: proj.deadline,
    });
  }
  for (const prog of academy.programs.slice(0, 1)) {
    activities.push({
      dotColor: "var(--purple)",
      title: "Session Academy",
      detail: `${prog.name} · ${prog.learners} inscrits`,
      time: prog.nextSession,
    });
  }

  return {
    kpis: {
      revenueMonthFcfa: monthRevenue,
      revenueMonthDelta:
        monthRevenue > 0 ? `▲ ${abbrevFcfa(Math.round(monthRevenue * 0.18))} ce mois` : "—",
      activeClients,
      clientsDelta: newClients > 0 ? `▲ +${newClients} ce mois` : "● stable",
      activeProjects,
      projectsLate,
      unpaidInvoices,
      invoicesLate,
    },
    alerts: alerts.slice(0, 12),
    missions,
    activities: activities.slice(0, 8),
    revenueHistory: buildRevenueHistory(monthRevenue || 12_400_000),
    poles,
    totalRevenueFcfa,
  };
}

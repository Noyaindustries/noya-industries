import { prisma } from "@/lib/prisma";
import {
  FALLBACK_ACADEMY_PROGRAMS,
  FALLBACK_COMMS_TEMPLATES,
  FALLBACK_CRM_ACTIVITIES,
  FALLBACK_CRM_CLIENTS,
  FALLBACK_INVOICES,
  FALLBACK_LEAVE_REQUESTS,
  FALLBACK_PROJECTS,
  FALLBACK_STOCK_ITEMS,
} from "./module-fallbacks";

async function ensureSeeded(): Promise<boolean> {
  if (!process.env.DATABASE_URL || !prisma?.crmClient?.count) return false;
  try {
    if ((await prisma.crmClient.count()) === 0) {
      await prisma.crmClient.createMany({ data: [...FALLBACK_CRM_CLIENTS] });
      await prisma.crmActivity.createMany({ data: [...FALLBACK_CRM_ACTIVITIES] });
      await prisma.financeInvoice.createMany({ data: [...FALLBACK_INVOICES] });
      await prisma.missionProject.createMany({ data: [...FALLBACK_PROJECTS] });
      await prisma.stockItem.createMany({ data: [...FALLBACK_STOCK_ITEMS] });
      await prisma.academyProgram.createMany({ data: [...FALLBACK_ACADEMY_PROGRAMS] });
      await prisma.leaveRequest.createMany({ data: [...FALLBACK_LEAVE_REQUESTS] });
      await prisma.commsTemplate.createMany({ data: [...FALLBACK_COMMS_TEMPLATES] });
    }
    return true;
  } catch {
    return false;
  }
}

export async function getCrmData() {
  const ok = await ensureSeeded();
  if (!ok) {
    return {
      clients: FALLBACK_CRM_CLIENTS.map((c) => ({ ...c, id: c.slug })),
      activities: FALLBACK_CRM_ACTIVITIES.map((a) => ({ ...a, id: a.title })),
    };
  }
  const [clients, activities] = await Promise.all([
    prisma.crmClient.findMany({ orderBy: { order: "asc" } }),
    prisma.crmActivity.findMany({ orderBy: { order: "asc" } }),
  ]);
  return { clients, activities };
}

export async function getFinanceData() {
  const ok = await ensureSeeded();
  if (!ok) {
    return { invoices: FALLBACK_INVOICES.map((i) => ({ ...i, id: i.number })) };
  }
  const invoices = await prisma.financeInvoice.findMany({ orderBy: { order: "asc" } });
  return { invoices };
}

export async function getProjectsData() {
  const ok = await ensureSeeded();
  if (!ok) {
    return { projects: FALLBACK_PROJECTS.map((p) => ({ ...p, id: p.slug })) };
  }
  const projects = await prisma.missionProject.findMany({ orderBy: { order: "asc" } });
  return { projects };
}

export async function getStockData() {
  const ok = await ensureSeeded();
  if (!ok) {
    return { items: FALLBACK_STOCK_ITEMS.map((i) => ({ ...i, id: i.ref })) };
  }
  const items = await prisma.stockItem.findMany({ orderBy: { order: "asc" } });
  return { items };
}

export async function getAcademyData() {
  const ok = await ensureSeeded();
  if (!ok) {
    return { programs: FALLBACK_ACADEMY_PROGRAMS.map((p) => ({ ...p, id: p.slug })) };
  }
  const programs = await prisma.academyProgram.findMany({ orderBy: { order: "asc" } });
  return { programs };
}

export async function getHrLeavesData() {
  const ok = await ensureSeeded();
  if (!ok) {
    return { leaves: FALLBACK_LEAVE_REQUESTS.map((l, i) => ({ ...l, id: `leave-${i}` })) };
  }
  const leaves = await prisma.leaveRequest.findMany({ orderBy: { order: "asc" } });
  return { leaves };
}

export async function getCommsData() {
  const ok = await ensureSeeded();
  if (!ok) {
    return {
      messages: [],
      templates: FALLBACK_COMMS_TEMPLATES.map((t) => ({ ...t, id: t.slug })),
    };
  }
  const [messages, templates] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.commsTemplate.findMany({ orderBy: { order: "asc" } }),
  ]);
  return { messages, templates };
}

export async function getTeamCount() {
  if (!process.env.DATABASE_URL) return FALLBACK_CRM_CLIENTS.length;
  try {
    return await prisma.teamMember.count();
  } catch {
    return 5;
  }
}

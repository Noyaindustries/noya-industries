import { PrismaClient } from "@prisma/client";
import {
  FALLBACK_ACADEMY_PROGRAMS,
  FALLBACK_COMMS_TEMPLATES,
  FALLBACK_CRM_ACTIVITIES,
  FALLBACK_CRM_CLIENTS,
  FALLBACK_INVOICES,
  FALLBACK_LEAVE_REQUESTS,
  FALLBACK_PROJECTS,
  FALLBACK_STOCK_ITEMS,
} from "../src/lib/dashboard/module-fallbacks";

const prisma = new PrismaClient();

async function main() {
  if (await prisma.crmClient.count() === 0) {
    await prisma.crmClient.createMany({ data: [...FALLBACK_CRM_CLIENTS] });
  }
  if (await prisma.crmActivity.count() === 0) {
    await prisma.crmActivity.createMany({ data: [...FALLBACK_CRM_ACTIVITIES] });
  }
  if (await prisma.financeInvoice.count() === 0) {
    await prisma.financeInvoice.createMany({ data: [...FALLBACK_INVOICES] });
  }
  if (await prisma.missionProject.count() === 0) {
    await prisma.missionProject.createMany({ data: [...FALLBACK_PROJECTS] });
  }
  if (await prisma.stockItem.count() === 0) {
    await prisma.stockItem.createMany({ data: [...FALLBACK_STOCK_ITEMS] });
  }
  if (await prisma.academyProgram.count() === 0) {
    await prisma.academyProgram.createMany({ data: [...FALLBACK_ACADEMY_PROGRAMS] });
  }
  if (await prisma.leaveRequest.count() === 0) {
    await prisma.leaveRequest.createMany({ data: [...FALLBACK_LEAVE_REQUESTS] });
  }
  if (await prisma.commsTemplate.count() === 0) {
    await prisma.commsTemplate.createMany({ data: [...FALLBACK_COMMS_TEMPLATES] });
  }
  console.log("Données dashboard initialisées.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFinanceData } from "@/lib/dashboard/module-store";

export async function GET() {
  return NextResponse.json(await getFinanceData());
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données requise." }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const number = typeof body?.number === "string" ? body.number.trim() : "";
  const client = typeof body?.client === "string" ? body.client.trim() : "";
  const mission = typeof body?.mission === "string" ? body.mission.trim() : "";
  if (!number || !client || !mission) {
    return NextResponse.json({ error: "Numéro, client et mission requis." }, { status: 400 });
  }

  try {
    const invoice = await prisma.financeInvoice.create({
      data: {
        number,
        client,
        mission,
        dateLabel: typeof body?.dateLabel === "string" ? body.dateLabel : "Aujourd'hui",
        dueLabel: typeof body?.dueLabel === "string" ? body.dueLabel : "—",
        amount: typeof body?.amount === "number" ? body.amount : 0,
        amountTone: body?.amountTone === "red" ? "red" : "gold",
        status: ["payé", "retard", "attente", "partiel"].includes(String(body?.status))
          ? String(body?.status)
          : "attente",
      },
    });
    return NextResponse.json({ invoice }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible de créer la facture." }, { status: 500 });
  }
}

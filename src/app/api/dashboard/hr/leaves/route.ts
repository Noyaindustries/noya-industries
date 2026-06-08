import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getHrLeavesData } from "@/lib/dashboard/module-store";

export async function GET() {
  return NextResponse.json(await getHrLeavesData());
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données requise." }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const employeeName = typeof body?.employeeName === "string" ? body.employeeName.trim() : "";
  if (!employeeName) return NextResponse.json({ error: "Nom employé requis." }, { status: 400 });

  try {
    const leave = await prisma.leaveRequest.create({
      data: {
        employeeName,
        periodLabel: typeof body?.periodLabel === "string" ? body.periodLabel : "—",
        durationLabel: typeof body?.durationLabel === "string" ? body.durationLabel : "—",
        reason: typeof body?.reason === "string" ? body.reason : "Congé",
        status: "pending",
      },
    });
    return NextResponse.json({ leave }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible de créer la demande." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données requise." }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const id = typeof body?.id === "string" ? body.id : "";
  const status = typeof body?.status === "string" ? body.status : "";
  if (!id || !["approved", "pending", "reviewed"].includes(status)) {
    return NextResponse.json({ error: "Données invalides." }, { status: 400 });
  }

  try {
    const leave = await prisma.leaveRequest.update({ where: { id }, data: { status } });
    return NextResponse.json({ leave });
  } catch {
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}

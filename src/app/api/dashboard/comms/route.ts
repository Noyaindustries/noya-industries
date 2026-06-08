import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCommsData } from "@/lib/dashboard/module-store";

export async function GET() {
  return NextResponse.json(await getCommsData());
}

export async function PATCH(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données requise." }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const id = typeof body?.id === "string" ? body.id : "";
  const status = typeof body?.status === "string" ? body.status : "";
  if (!id || !["new", "read", "archived"].includes(status)) {
    return NextResponse.json({ error: "ID et statut invalides." }, { status: 400 });
  }

  try {
    const message = await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}

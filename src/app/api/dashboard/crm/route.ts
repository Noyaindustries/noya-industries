import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCrmData } from "@/lib/dashboard/module-store";

export async function GET() {
  return NextResponse.json(await getCrmData());
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données requise." }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : name.toLowerCase().replace(/\s+/g, "-");
  if (!name || !slug) return NextResponse.json({ error: "Nom client requis." }, { status: 400 });

  try {
    const client = await prisma.crmClient.create({
      data: {
        slug,
        name,
        sector: typeof body?.sector === "string" ? body.sector : "Autre",
        pole: body?.pole === "tech" ? "tech" : "consulting",
        value: typeof body?.value === "number" ? body.value : 0,
        contactDate: typeof body?.contactDate === "string" ? body.contactDate : "Aujourd'hui",
        status: body?.status === "relance" || body?.status === "retard" ? body.status : "actif",
        initials: name.slice(0, 2).toUpperCase(),
        avBg: "var(--cobalt2)",
      },
    });
    return NextResponse.json({ client }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible de créer le client." }, { status: 500 });
  }
}

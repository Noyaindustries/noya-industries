import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getProjectsData } from "@/lib/dashboard/module-store";

export async function GET() {
  return NextResponse.json(await getProjectsData());
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données requise." }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const client = typeof body?.client === "string" ? body.client.trim() : "";
  const slug = typeof body?.slug === "string" ? body.slug.trim() : name.toLowerCase().replace(/\s+/g, "-");
  if (!name || !client) return NextResponse.json({ error: "Nom et client requis." }, { status: 400 });

  try {
    const project = await prisma.missionProject.create({
      data: {
        slug,
        name,
        client,
        ownerInitials: typeof body?.ownerInitials === "string" ? body.ownerInitials : "NI",
        ownerBg: "var(--gold)",
        deadline: typeof body?.deadline === "string" ? body.deadline : "—",
        progress: typeof body?.progress === "number" ? body.progress : 0,
        barColor: "var(--cobalt2)",
        status: "en_cours",
      },
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible de créer le projet." }, { status: 500 });
  }
}

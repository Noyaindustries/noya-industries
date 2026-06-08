import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAcademyData } from "@/lib/dashboard/module-store";

export async function GET() {
  return NextResponse.json(await getAcademyData());
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données requise." }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const slug = typeof body?.slug === "string" ? body.slug.trim() : name.toLowerCase().replace(/\s+/g, "-");
  if (!name) return NextResponse.json({ error: "Nom du programme requis." }, { status: 400 });

  const typeRaw = typeof body?.type === "string" ? body.type : "presentiel";
  const type = ["presentiel", "ligne", "hybride"].includes(typeRaw) ? typeRaw : "presentiel";

  try {
    const program = await prisma.academyProgram.create({
      data: {
        slug,
        name,
        type,
        learners: typeof body?.learners === "number" ? body.learners : 0,
        progress: typeof body?.progress === "number" ? body.progress : 0,
        nextSession: typeof body?.nextSession === "string" ? body.nextSession : "—",
      },
    });
    return NextResponse.json({ program }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible de créer le programme." }, { status: 500 });
  }
}

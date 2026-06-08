import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getStockData } from "@/lib/dashboard/module-store";

export async function GET() {
  return NextResponse.json(await getStockData());
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données requise." }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const ref = typeof body?.ref === "string" ? body.ref.trim().toUpperCase() : "";
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  if (!ref || !label) return NextResponse.json({ error: "Référence et libellé requis." }, { status: 400 });

  try {
    const item = await prisma.stockItem.create({
      data: {
        ref,
        label,
        category: typeof body?.category === "string" ? body.category : "Général",
        quantity: typeof body?.quantity === "number" ? body.quantity : 0,
        price: typeof body?.price === "number" ? body.price : 0,
        minQuantity: typeof body?.minQuantity === "number" ? body.minQuantity : 5,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Impossible de créer l'article." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données requise." }, { status: 503 });
  }
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const ref = typeof body?.ref === "string" ? body.ref.trim().toUpperCase() : "";
  if (!ref) return NextResponse.json({ error: "Référence requise." }, { status: 400 });

  try {
    const item = await prisma.stockItem.update({
      where: { ref },
      data: {
        quantity: typeof body?.quantity === "number" ? body.quantity : undefined,
        price: typeof body?.price === "number" ? body.price : undefined,
        label: typeof body?.label === "string" ? body.label : undefined,
      },
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Mise à jour impossible." }, { status: 500 });
  }
}

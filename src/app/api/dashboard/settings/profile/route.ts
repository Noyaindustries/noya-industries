import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedAdmin, getAuthenticatedAdminId } from "@/lib/dashboard-request-auth";

type ProfilePayload = {
  name?: string;
  email?: string;
};

function parseProfilePayload(body: unknown): ProfilePayload | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const payload: ProfilePayload = {};

  if (typeof raw.name === "string") {
    const name = raw.name.trim();
    if (name.length >= 2) payload.name = name;
  }

  if (typeof raw.email === "string") {
    const email = raw.email.trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) payload.email = email;
  }

  return Object.keys(payload).length > 0 ? payload : null;
}

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Profil admin indisponible pour cette session." },
      { status: 403 },
    );
  }

  return NextResponse.json({
    profile: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      createdAt: admin.createdAt.toISOString(),
      updatedAt: admin.updatedAt.toISOString(),
    },
  });
}

export async function PUT(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données indisponible." }, { status: 503 });
  }

  const adminId = await getAuthenticatedAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Session admin non reconnue." }, { status: 403 });
  }

  const payload = parseProfilePayload(await request.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ error: "Profil invalide." }, { status: 400 });
  }

  try {
    const updated = await prisma.adminUser.update({
      where: { id: adminId },
      data: payload,
      select: { id: true, name: true, email: true, updatedAt: true, createdAt: true },
    });

    return NextResponse.json({
      profile: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Impossible de mettre à jour le profil (email peut-être déjà utilisé)." },
      { status: 500 },
    );
  }
}

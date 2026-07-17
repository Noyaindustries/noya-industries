import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  hashPassword,
  isStrongAdminPassword,
  verifyPassword,
} from "@/lib/admin-auth";
import { getAuthenticatedAdminId } from "@/lib/dashboard-request-auth";
import { prisma } from "@/lib/prisma";

type PasswordPayload = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données indisponible." }, { status: 503 });
  }

  const adminId = await getAuthenticatedAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Session admin non reconnue." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as PasswordPayload | null;
  const currentPassword = body?.currentPassword?.trim() ?? "";
  const newPassword = body?.newPassword?.trim() ?? "";
  const confirmPassword = body?.confirmPassword?.trim() ?? "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "Tous les champs mot de passe sont requis." }, { status: 400 });
  }

  if (!isStrongAdminPassword(newPassword)) {
    return NextResponse.json(
      {
        error:
          "Le mot de passe doit contenir au moins 12 caractères, avec majuscule, minuscule, chiffre et symbole.",
      },
      { status: 400 },
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Les mots de passe ne correspondent pas." }, { status: 400 });
  }

  try {
    const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
    if (!admin) {
      return NextResponse.json({ error: "Administrateur introuvable." }, { status: 404 });
    }

    const isValid = await verifyPassword(currentPassword, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect." }, { status: 401 });
    }
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "Le nouveau mot de passe doit être différent de l'ancien." },
        { status: 400 },
      );
    }

    await prisma.adminUser.update({
      where: { id: adminId },
      data: {
        passwordHash: await hashPassword(newPassword),
        passwordChangedAt: new Date(),
      },
    });

    const response = NextResponse.json(
      { ok: true, reauthenticationRequired: true },
      { headers: { "Cache-Control": "no-store" } },
    );
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: "",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      priority: "high",
      expires: new Date(0),
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Impossible de changer le mot de passe." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { hashPassword, verifyPassword } from "@/lib/admin-auth";
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

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Le nouveau mot de passe doit contenir au moins 8 caractères." },
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

    await prisma.adminUser.update({
      where: { id: adminId },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Impossible de changer le mot de passe." }, { status: 500 });
  }
}

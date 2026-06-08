import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  buildAdminSessionValue,
  buildAdminToken,
  buildLegacyAdminSessionValue,
  getConfiguredAdminPassword,
  verifyPassword,
} from "@/lib/admin-auth";

type LoginPayload = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LoginPayload | null;
  const submittedPassword = body?.password?.trim() ?? "";
  const submittedEmail = body?.email?.trim().toLowerCase() ?? "";

  if (!submittedPassword) {
    return NextResponse.json({ error: "Mot de passe requis." }, { status: 400 });
  }

  let sessionValue: string | null = null;

  if (process.env.DATABASE_URL && submittedEmail) {
    try {
      const admin = await prisma.adminUser.findUnique({ where: { email: submittedEmail } });
      if (admin && (await verifyPassword(submittedPassword, admin.passwordHash))) {
        sessionValue = buildAdminSessionValue(admin.id, await buildAdminToken(admin.id));
      }
    } catch {
      // Fallback vers ADMIN_PASSWORD si la base est indisponible.
    }
  }

  if (!sessionValue) {
    const configuredPassword = getConfiguredAdminPassword();
    if (!configuredPassword) {
      return NextResponse.json(
        { error: "Aucun administrateur configuré. Lancez npm run admin:create." },
        { status: 500 },
      );
    }
    if (submittedPassword !== configuredPassword) {
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }
    sessionValue = await buildLegacyAdminSessionValue(configuredPassword);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: sessionValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}

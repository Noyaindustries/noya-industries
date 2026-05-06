import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  buildAdminToken,
  getConfiguredAdminPassword,
} from "@/lib/admin-auth";

type LoginPayload = {
  password?: string;
};

export async function POST(request: Request) {
  const configuredPassword = getConfiguredAdminPassword();
  if (!configuredPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD n'est pas configuré sur le serveur." },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as LoginPayload | null;
  const submittedPassword = body?.password?.trim() ?? "";
  if (!submittedPassword) {
    return NextResponse.json({ error: "Mot de passe requis." }, { status: 400 });
  }
  if (submittedPassword !== configuredPassword) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: await buildAdminToken(configuredPassword),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}


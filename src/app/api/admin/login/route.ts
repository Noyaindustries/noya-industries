import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  buildAdminSessionValue,
  buildLegacyAdminSessionValue,
  getConfiguredAdminPassword,
  timingSafeStringEqual,
  hashPassword,
  verifyPassword,
} from "@/lib/admin-auth";
import {
  clearRateLimit,
  consumeRateLimit,
  getClientIp,
  getRateLimitStatus,
  type RateLimitResult,
} from "@/lib/security/rate-limit";

type LoginPayload = {
  email?: string;
  password?: string;
};

const IP_LOGIN_RATE_LIMIT = { limit: 10, windowMs: 10 * 60 * 1000 };
const IDENTITY_LOGIN_RATE_LIMIT = { limit: 25, windowMs: 15 * 60 * 1000 };
const MAX_LOGIN_BODY_BYTES = 8 * 1024;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let dummyPasswordHash: Promise<string> | null = null;

function getDummyPasswordHash(): Promise<string> {
  dummyPasswordHash ??= hashPassword("invalid-password-padding-value");
  return dummyPasswordHash;
}

function rateLimitResponse(
  ipLimit: RateLimitResult,
  identityLimit: RateLimitResult,
) {
  const retryAfterSeconds = Math.max(
    ipLimit.retryAfterSeconds,
    identityLimit.retryAfterSeconds,
  );
  const retryAfterMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
  return NextResponse.json(
    {
      error: `Trop de tentatives incorrectes. Réessayez dans environ ${retryAfterMinutes} minute${retryAfterMinutes > 1 ? "s" : ""}.`,
      retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds),
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(request: Request) {
  const contentLength = Number.parseInt(
    request.headers.get("content-length") ?? "0",
    10,
  );
  if (Number.isFinite(contentLength) && contentLength > MAX_LOGIN_BODY_BYTES) {
    return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 });
  }

  const clientIp = getClientIp(request);
  const body = (await request.json().catch(() => null)) as LoginPayload | null;
  const submittedPassword = body?.password?.trim() ?? "";
  const submittedEmail = body?.email?.trim().toLowerCase() ?? "";
  const ipRateLimitKey = `admin-login:ip:${clientIp}`;
  const identityRateLimitKey = `admin-login:identity:${submittedEmail || "legacy"}`;
  const ipLimit = getRateLimitStatus(ipRateLimitKey, IP_LOGIN_RATE_LIMIT);
  const identityLimit = getRateLimitStatus(
    identityRateLimitKey,
    IDENTITY_LOGIN_RATE_LIMIT,
  );

  if (!ipLimit.allowed || !identityLimit.allowed) {
    return rateLimitResponse(ipLimit, identityLimit);
  }

  if (!submittedPassword) {
    return NextResponse.json({ error: "Mot de passe requis." }, { status: 400 });
  }

  let sessionValue: string | null = null;

  if (process.env.DATABASE_URL) {
    if (!submittedEmail || !emailPattern.test(submittedEmail)) {
      return NextResponse.json(
        { error: "Adresse e-mail et mot de passe requis." },
        { status: 400 },
      );
    }

    try {
      const admin = await prisma.adminUser.findUnique({ where: { email: submittedEmail } });
      const passwordHash = admin?.passwordHash ?? (await getDummyPasswordHash());
      if (await verifyPassword(submittedPassword, passwordHash)) {
        if (admin) sessionValue = await buildAdminSessionValue(admin.id);
      }
    } catch {
      return NextResponse.json(
        { error: "Service d'authentification temporairement indisponible." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
  } else {
    const configuredPassword = getConfiguredAdminPassword();
    if (!configuredPassword) {
      return NextResponse.json(
        { error: "Aucun administrateur configuré. Lancez npm run admin:create." },
        { status: 500 },
      );
    }
    if (timingSafeStringEqual(submittedPassword, configuredPassword)) {
      sessionValue = await buildLegacyAdminSessionValue(configuredPassword);
    }
  }

  if (!sessionValue) {
    consumeRateLimit(ipRateLimitKey, IP_LOGIN_RATE_LIMIT);
    consumeRateLimit(identityRateLimitKey, IDENTITY_LOGIN_RATE_LIMIT);
    return NextResponse.json(
      { error: "Identifiants incorrects." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  clearRateLimit(ipRateLimitKey);
  clearRateLimit(identityRateLimitKey);

  const response = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: sessionValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    priority: "high",
  });
  return response;
}

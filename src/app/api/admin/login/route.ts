import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_EXTENDED_SECONDS,
  ADMIN_SESSION_TTL_SECONDS,
  buildAdminSessionValue,
  buildLegacyAdminSessionValue,
  getConfiguredAdminPassword,
  timingSafeStringEqual,
  verifyPassword,
} from "@/lib/admin-auth";
import {
  clearRateLimit,
  consumeRateLimit,
  getClientIp,
  getRateLimitStatus,
  type RateLimitResult,
} from "@/lib/security/rate-limit";
import { getAppSettings } from "@/lib/site-settings";

type LoginPayload = {
  email?: string;
  password?: string;
};

const IP_LOGIN_RATE_LIMIT = { limit: 10, windowMs: 10 * 60 * 1000 };
const IDENTITY_LOGIN_RATE_LIMIT = { limit: 25, windowMs: 15 * 60 * 1000 };
const MAX_LOGIN_BODY_BYTES = 8 * 1024;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Hash fixe (mot de passe factice) pour égaliser le temps de réponse sans coût PBKDF2 à chaque requête.
const DUMMY_PASSWORD_HASH =
  "pbkdf2:100000:5f8d7c6b5a4938271605f4e3d2c1b0a9:9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b";

function getDummyPasswordHash(): string {
  return DUMMY_PASSWORD_HASH;
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

  let authenticatedAdminId: string | null = null;

  if (process.env.DATABASE_URL) {
    if (!submittedEmail || !emailPattern.test(submittedEmail)) {
      return NextResponse.json(
        { error: "Adresse e-mail et mot de passe requis." },
        { status: 400 },
      );
    }

    try {
      const admin = await prisma.adminUser.findUnique({
        where: { email: submittedEmail },
      });
      const passwordHash = admin?.passwordHash ?? getDummyPasswordHash();
      const passwordOk = await verifyPassword(submittedPassword, passwordHash);
      if (passwordOk && admin) {
        authenticatedAdminId = admin.id;
      }
    } catch (error) {
      console.error("[admin/login] database auth failed", error);
      return NextResponse.json(
        {
          error:
            "Base de données inaccessible. Vérifiez DATABASE_URL et l'accès réseau MongoDB (IP Vercel).",
        },
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
      authenticatedAdminId = "legacy";
    }
  }

  if (!authenticatedAdminId) {
    consumeRateLimit(ipRateLimitKey, IP_LOGIN_RATE_LIMIT);
    consumeRateLimit(identityRateLimitKey, IDENTITY_LOGIN_RATE_LIMIT);
    return NextResponse.json(
      { error: "Identifiants incorrects." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const settings = await getAppSettings();
  const sessionTtlSeconds = settings.sessionTimeoutEnabled
    ? ADMIN_SESSION_TTL_SECONDS
    : ADMIN_SESSION_TTL_EXTENDED_SECONDS;

  let passwordRotationRequired = false;
  if (authenticatedAdminId !== "legacy" && process.env.DATABASE_URL) {
    try {
      const admin = await prisma.adminUser.findUnique({
        where: { id: authenticatedAdminId },
      });
      if (admin) {
        const changedAt =
          admin.passwordChangedAt instanceof Date
            ? admin.passwordChangedAt.getTime()
            : admin.createdAt.getTime();
        const ageDays = (Date.now() - changedAt) / (24 * 60 * 60 * 1000);
        passwordRotationRequired = ageDays >= settings.passwordRotationDays;

        await prisma.adminUser.update({
          where: { id: admin.id },
          data: {
            lastLoginAt: new Date(),
            lastLoginIp: clientIp,
          },
        });

        if (settings.loginAlerts) {
          console.info("[admin/login] successful login", {
            adminId: admin.id,
            email: admin.email,
            ip: clientIp,
            passwordRotationRequired,
          });
        }
      }
    } catch (error) {
      console.error("[admin/login] post-auth update failed", error);
    }
  }

  let sessionValue: string;
  try {
    sessionValue =
      authenticatedAdminId === "legacy"
        ? await buildLegacyAdminSessionValue(getConfiguredAdminPassword() ?? "")
        : await buildAdminSessionValue(
            authenticatedAdminId,
            Date.now(),
            sessionTtlSeconds,
          );
  } catch (error) {
    console.error("[admin/login] session secret failed", error);
    return NextResponse.json(
      {
        error:
          "Configuration serveur incomplète : définissez ADMIN_SESSION_SECRET (≥ 32 caractères) dans Vercel.",
      },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }

  clearRateLimit(ipRateLimitKey);
  clearRateLimit(identityRateLimitKey);

  const response = NextResponse.json(
    { ok: true, passwordRotationRequired },
    { headers: { "Cache-Control": "no-store" } },
  );
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: sessionValue,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionTtlSeconds,
    priority: "high",
  });
  return response;
}

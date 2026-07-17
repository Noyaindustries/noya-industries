import { NextResponse } from "next/server";
import {
  DEFAULT_APP_SETTINGS,
  getAppSettings,
  pingDatabase,
  upsertAppSettings,
  type AppSettingsRecord,
} from "@/lib/site-settings";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseRotationDays(value: unknown): 30 | 60 | 90 | null {
  const numeric = typeof value === "string" ? Number.parseInt(value, 10) : value;
  if (numeric === 30 || numeric === 60 || numeric === 90) return numeric;
  return null;
}

function parseOptionalUrl(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parsePayload(body: unknown): Partial<AppSettingsRecord> | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const payload: Partial<AppSettingsRecord> = {};

  const stringFields: Array<
    keyof Pick<
      AppSettingsRecord,
      | "companyName"
      | "legalName"
      | "contactEmail"
      | "phone"
      | "website"
      | "city"
      | "address"
    >
  > = ["companyName", "legalName", "contactEmail", "phone", "website", "city", "address"];

  for (const field of stringFields) {
    if (typeof raw[field] === "string") {
      const trimmed = raw[field].trim();
      if (trimmed.length > 0) payload[field] = trimmed;
    }
  }

  if (typeof raw.phoneSecondary === "string") {
    payload.phoneSecondary = raw.phoneSecondary.trim() || null;
  } else if (raw.phoneSecondary === null) {
    payload.phoneSecondary = null;
  }

  if (typeof raw.twoFactorEnabled === "boolean") payload.twoFactorEnabled = raw.twoFactorEnabled;
  if (typeof raw.loginAlerts === "boolean") payload.loginAlerts = raw.loginAlerts;
  if (typeof raw.sessionTimeoutEnabled === "boolean") {
    payload.sessionTimeoutEnabled = raw.sessionTimeoutEnabled;
  }
  if (typeof raw.infinitecoreWebhookEnabled === "boolean") {
    payload.infinitecoreWebhookEnabled = raw.infinitecoreWebhookEnabled;
  }

  const rotation = parseRotationDays(raw.passwordRotationDays);
  if (rotation) payload.passwordRotationDays = rotation;

  const webhookUrl = parseOptionalUrl(raw.infinitecoreWebhookUrl);
  if (webhookUrl !== undefined) payload.infinitecoreWebhookUrl = webhookUrl;

  const recruitmentUrl = parseOptionalUrl(raw.recruitmentPublicUrl);
  if (recruitmentUrl !== undefined) payload.recruitmentPublicUrl = recruitmentUrl;

  return Object.keys(payload).length > 0 ? payload : null;
}

function validatePayload(payload: Partial<AppSettingsRecord>): string | null {
  if (payload.contactEmail && !emailPattern.test(payload.contactEmail)) {
    return "Email de contact invalide.";
  }
  if (payload.website) {
    try {
      const url = new URL(payload.website);
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return "Le site web doit commencer par http:// ou https://.";
      }
    } catch {
      return "URL du site web invalide.";
    }
  }
  if (payload.infinitecoreWebhookUrl) {
    try {
      const url = new URL(payload.infinitecoreWebhookUrl);
      if (url.protocol !== "https:") {
        return "Le webhook Infinite Core doit utiliser HTTPS.";
      }
    } catch {
      return "URL webhook Infinite Core invalide.";
    }
  }
  return null;
}

export async function GET() {
  const [settings, databaseReachable] = await Promise.all([
    getAppSettings(),
    pingDatabase(),
  ]);
  return NextResponse.json({
    settings,
    databaseConnected: databaseReachable,
    defaults: DEFAULT_APP_SETTINGS,
  });
}

export async function PUT(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL est requis pour enregistrer les paramètres." },
      { status: 503 },
    );
  }

  const payload = parsePayload(await request.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ error: "Payload paramètres invalide." }, { status: 400 });
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const settings = await upsertAppSettings(payload);
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Impossible d'enregistrer les paramètres." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import {
  DEFAULT_APP_SETTINGS,
  getAppSettings,
  upsertAppSettings,
  type AppSettingsRecord,
} from "@/lib/site-settings";

function parseRotationDays(value: unknown): 30 | 60 | 90 | null {
  const numeric = typeof value === "string" ? Number.parseInt(value, 10) : value;
  if (numeric === 30 || numeric === 60 || numeric === 90) return numeric;
  return null;
}

function parsePayload(body: unknown): Partial<AppSettingsRecord> | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const payload: Partial<AppSettingsRecord> = {};

  const stringFields: Array<keyof Pick<
    AppSettingsRecord,
    "companyName" | "legalName" | "contactEmail" | "phone" | "website" | "city" | "address"
  >> = ["companyName", "legalName", "contactEmail", "phone", "website", "city", "address"];

  for (const field of stringFields) {
    if (typeof raw[field] === "string") {
      const trimmed = raw[field].trim();
      if (trimmed.length > 0) payload[field] = trimmed;
    }
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

  if (raw.infinitecoreWebhookUrl === null) {
    payload.infinitecoreWebhookUrl = null;
  } else if (typeof raw.infinitecoreWebhookUrl === "string") {
    payload.infinitecoreWebhookUrl = raw.infinitecoreWebhookUrl.trim() || null;
  }

  if (raw.recruitmentPublicUrl === null) {
    payload.recruitmentPublicUrl = null;
  } else if (typeof raw.recruitmentPublicUrl === "string") {
    payload.recruitmentPublicUrl = raw.recruitmentPublicUrl.trim() || null;
  }

  return Object.keys(payload).length > 0 ? payload : null;
}

export async function GET() {
  const settings = await getAppSettings();
  return NextResponse.json({
    settings,
    databaseConnected: Boolean(process.env.DATABASE_URL),
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

  try {
    const settings = await upsertAppSettings(payload);
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Impossible d'enregistrer les paramètres." }, { status: 500 });
  }
}

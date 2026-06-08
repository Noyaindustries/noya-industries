import { prisma } from "@/lib/prisma";
import { NOYA_CONTACT_EMAIL } from "@/lib/contact-email";

export const APP_SETTINGS_ID = "default";

export type AppSettingsRecord = {
  companyName: string;
  legalName: string;
  contactEmail: string;
  phone: string;
  website: string;
  city: string;
  address: string;
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeoutEnabled: boolean;
  passwordRotationDays: 30 | 60 | 90;
  infinitecoreWebhookUrl: string | null;
  infinitecoreWebhookEnabled: boolean;
  recruitmentPublicUrl: string | null;
  updatedAt: string | null;
};

export const DEFAULT_APP_SETTINGS: AppSettingsRecord = {
  companyName: "Noya Industries",
  legalName: "Noya Industries SARL",
  contactEmail: NOYA_CONTACT_EMAIL,
  phone: "+225 01 03 015 467",
  website: "https://noyaindustries.com",
  city: "Abidjan",
  address: "Riviera, Abidjan, Côte d'Ivoire",
  twoFactorEnabled: false,
  loginAlerts: true,
  sessionTimeoutEnabled: true,
  passwordRotationDays: 90,
  infinitecoreWebhookUrl:
    process.env.INFINITECORE_RECRUTEMENT_WEBHOOK_URL ??
    "https://www.infinitecore.net/api/webhooks/noya-recrutement",
  infinitecoreWebhookEnabled: true,
  recruitmentPublicUrl: process.env.NEXT_PUBLIC_NOYA_RECRUTEMENT_URL ?? "/recrutement#travailler-avec-nous",
  updatedAt: null,
};

function normalizeRotationDays(value: number): 30 | 60 | 90 {
  if (value === 30 || value === 60) return value;
  return 90;
}

export function toAppSettingsRecord(row: {
  companyName: string;
  legalName: string;
  contactEmail: string;
  phone: string;
  website: string;
  city: string;
  address: string;
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  sessionTimeoutEnabled: boolean;
  passwordRotationDays: number;
  infinitecoreWebhookUrl: string | null;
  infinitecoreWebhookEnabled: boolean;
  recruitmentPublicUrl: string | null;
  updatedAt: Date;
}): AppSettingsRecord {
  return {
    companyName: row.companyName,
    legalName: row.legalName,
    contactEmail: row.contactEmail,
    phone: row.phone,
    website: row.website,
    city: row.city,
    address: row.address,
    twoFactorEnabled: row.twoFactorEnabled,
    loginAlerts: row.loginAlerts,
    sessionTimeoutEnabled: row.sessionTimeoutEnabled,
    passwordRotationDays: normalizeRotationDays(row.passwordRotationDays),
    infinitecoreWebhookUrl: row.infinitecoreWebhookUrl,
    infinitecoreWebhookEnabled: row.infinitecoreWebhookEnabled,
    recruitmentPublicUrl: row.recruitmentPublicUrl,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getAppSettings(): Promise<AppSettingsRecord> {
  if (!process.env.DATABASE_URL || !prisma?.appSettings?.findUnique) {
    return DEFAULT_APP_SETTINGS;
  }

  try {
    const row = await prisma.appSettings.findUnique({ where: { id: APP_SETTINGS_ID } });
    if (!row) return DEFAULT_APP_SETTINGS;
    return toAppSettingsRecord(row);
  } catch {
    return DEFAULT_APP_SETTINGS;
  }
}

export async function upsertAppSettings(
  input: Partial<AppSettingsRecord>,
): Promise<AppSettingsRecord> {
  const current = await getAppSettings();
  const merged: AppSettingsRecord = {
    ...current,
    ...input,
    passwordRotationDays: normalizeRotationDays(
      input.passwordRotationDays ?? current.passwordRotationDays,
    ),
  };

  if (!process.env.DATABASE_URL || !prisma?.appSettings?.upsert) {
    return merged;
  }

  const row = await prisma.appSettings.upsert({
    where: { id: APP_SETTINGS_ID },
    create: {
      id: APP_SETTINGS_ID,
      companyName: merged.companyName,
      legalName: merged.legalName,
      contactEmail: merged.contactEmail,
      phone: merged.phone,
      website: merged.website,
      city: merged.city,
      address: merged.address,
      twoFactorEnabled: merged.twoFactorEnabled,
      loginAlerts: merged.loginAlerts,
      sessionTimeoutEnabled: merged.sessionTimeoutEnabled,
      passwordRotationDays: merged.passwordRotationDays,
      infinitecoreWebhookUrl: merged.infinitecoreWebhookUrl,
      infinitecoreWebhookEnabled: merged.infinitecoreWebhookEnabled,
      recruitmentPublicUrl: merged.recruitmentPublicUrl,
    },
    update: {
      companyName: merged.companyName,
      legalName: merged.legalName,
      contactEmail: merged.contactEmail,
      phone: merged.phone,
      website: merged.website,
      city: merged.city,
      address: merged.address,
      twoFactorEnabled: merged.twoFactorEnabled,
      loginAlerts: merged.loginAlerts,
      sessionTimeoutEnabled: merged.sessionTimeoutEnabled,
      passwordRotationDays: merged.passwordRotationDays,
      infinitecoreWebhookUrl: merged.infinitecoreWebhookUrl,
      infinitecoreWebhookEnabled: merged.infinitecoreWebhookEnabled,
      recruitmentPublicUrl: merged.recruitmentPublicUrl,
    },
  });

  return toAppSettingsRecord(row);
}

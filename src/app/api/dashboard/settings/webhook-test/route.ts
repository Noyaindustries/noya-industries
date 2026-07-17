import { NextResponse } from "next/server";
import { getAppSettings } from "@/lib/site-settings";

const DEFAULT_INFINITECORE_WEBHOOK_URL =
  "https://www.infinitecore.net/api/webhooks/noya-recrutement";

function getValidatedWebhookEndpoint(configuredEndpoint: string): string {
  const endpoint = new URL(configuredEndpoint);
  const allowedHosts = new Set(
    (process.env.NOYA_ALLOWED_WEBHOOK_HOSTS ?? "www.infinitecore.net")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean),
  );

  if (
    endpoint.protocol !== "https:" ||
    !allowedHosts.has(endpoint.hostname.toLowerCase()) ||
    endpoint.username ||
    endpoint.password
  ) {
    throw new Error("Endpoint rejeté par la politique de sécurité (HTTPS + hôte autorisé).");
  }
  return endpoint.toString();
}

export async function POST() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "Base de données indisponible." }, { status: 503 });
  }

  const settings = await getAppSettings();
  if (!settings.infinitecoreWebhookEnabled) {
    return NextResponse.json(
      { error: "Le webhook Infinite Core est désactivé dans les paramètres." },
      { status: 400 },
    );
  }

  try {
    const configuredEndpoint =
      settings.infinitecoreWebhookUrl?.trim() ||
      process.env.INFINITECORE_RECRUTEMENT_WEBHOOK_URL ||
      DEFAULT_INFINITECORE_WEBHOOK_URL;
    const endpoint = getValidatedWebhookEndpoint(configuredEndpoint);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);
    const response = await fetch(endpoint, {
      method: "OPTIONS",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "Noya-Industries-Settings-Webhook-Test/1.0",
      },
    }).finally(() => clearTimeout(timeout));

    return NextResponse.json({
      ok: true,
      endpoint,
      status: response.status,
      reachable: response.status < 500,
      message:
        response.status < 500
          ? "Webhook joignable."
          : "Le serveur distant a répondu avec une erreur.",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Impossible de tester le webhook.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

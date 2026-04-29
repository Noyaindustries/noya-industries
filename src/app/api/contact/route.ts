import { NextResponse } from "next/server";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ForwardPayload = {
  name: string;
  email: string;
  message: string;
  company: string | null;
  phone: string | null;
  topic: string | null;
};

async function forwardToInfiniteCore(payload: ForwardPayload) {
  const endpoint =
    process.env.INFINITECORE_RECRUTEMENT_WEBHOOK_URL ??
    "https://infinitecore.net/api/webhooks/noya-recrutement";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    // Vercel Security Checkpoint peut bloquer les requêtes “bot-like”. On envoie un UA
    // navigateur pour que le webhook accepte les POST server-to-server.
    "User-Agent":
      process.env.NOYA_INFINITECORE_WEBHOOK_USER_AGENT ??
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
  };

  const secret = process.env.NOYA_RECRUTEMENT_WEBHOOK_SECRET;
  if (secret && secret.trim().length > 0) {
    headers["X-Webhook-Secret"] = secret.trim();
  }

  const requestBody =
    secret && secret.trim().length > 0
      ? { ...payload, webhookSecret: secret.trim() }
      : payload;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      let details: unknown = null;
      try {
        details = await res.json();
      } catch {
        // ignore non-JSON response body
      }

      const errorFromDetails =
        details && typeof details === "object" && "error" in details
          ? (details as Record<string, unknown>).error
          : undefined;

      return NextResponse.json(
        {
          error:
            typeof errorFromDetails === "string"
              ? errorFromDetails
              : "Webhook Infinite Core a refusé la requête.",
          details,
        },
        { status: res.status },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      {
        error: "Impossible de joindre le webhook Infinite Core.",
        details: e instanceof Error ? e.message : String(e),
      },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const message = typeof b.message === "string" ? b.message.trim() : "";
  const company = typeof b.company === "string" ? b.company.trim() : undefined;
  const phone = typeof b.phone === "string" ? b.phone.trim() : undefined;
  const topic = typeof b.topic === "string" ? b.topic.trim() : undefined;

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Le nom est requis." }, { status: 400 });
  }
  if (!email || !emailRe.test(email)) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }
  if (!message || message.length < 10) {
    return NextResponse.json(
      { error: "Le message doit contenir au moins 10 caractères." },
      { status: 400 },
    );
  }

  const payload: ForwardPayload = {
    name,
    email,
    message,
    company: company ?? null,
    phone: phone ?? null,
    topic: topic ?? null,
  };

  return forwardToInfiniteCore(payload);
}

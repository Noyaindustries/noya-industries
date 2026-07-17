import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { getAppSettings } from "@/lib/site-settings";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ForwardPayload = {
  name: string;
  email: string;
  message: string;
  company: string | null;
  phone: string | null;
  topic: string | null;
};

/** Limite prudente pour les liens mailto (varie selon les clients). */
const MAILTO_MAX_LEN = 1950;
const MAX_CONTACT_BODY_BYTES = 16 * 1024;

function buildContactMailto(payload: ForwardPayload, contactEmail: string): string {
  const topicLine = payload.topic ? `Sujet : ${payload.topic}\n` : "";
  const companyLine = payload.company ? `Organisation : ${payload.company}\n` : "";
  const phoneLine = payload.phone ? `Téléphone : ${payload.phone}\n` : "";
  const body =
    `${topicLine}${companyLine}${phoneLine}\n---\n\n${payload.message}\n\n—\n${payload.name}\n${payload.email}`;
  const subject = payload.topic
    ? `[Site Noya] ${payload.topic} — ${payload.name}`
    : `[Site Noya] Contact — ${payload.name}`;

  let href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (href.length > MAILTO_MAX_LEN) {
    const suffix = "\n\n[Message tronqué — renvoyez la suite par un second email si besoin.]";
    let trimmed = body;
    while (
      `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(trimmed + suffix)}`.length >
        MAILTO_MAX_LEN && trimmed.length > 200
    ) {
      trimmed = trimmed.slice(0, Math.floor(trimmed.length * 0.85));
    }
    href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(trimmed + suffix)}`;
  }
  return href;
}

export async function POST(request: Request) {
  const contentLength = Number.parseInt(
    request.headers.get("content-length") ?? "0",
    10,
  );
  if (Number.isFinite(contentLength) && contentLength > MAX_CONTACT_BODY_BYTES) {
    return NextResponse.json({ error: "Requête trop volumineuse." }, { status: 413 });
  }

  const rateLimit = consumeRateLimit(`contact:${getClientIp(request)}`, {
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de messages envoyés. Réessayez plus tard." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      },
    );
  }

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
    company: company && company.length > 0 ? company : null,
    phone: phone && phone.length > 0 ? phone : null,
    topic: topic && topic.length > 0 ? topic : null,
  };

  if (process.env.DATABASE_URL) {
    try {
      await prisma.contactMessage.create({
        data: {
          name: payload.name,
          email: payload.email,
          message: payload.message,
          company: payload.company,
          phone: payload.phone,
          topic: payload.topic,
          status: "new",
        },
      });
    } catch {
      // Le mailto reste disponible même si l'enregistrement échoue.
    }
  }

  const settings = await getAppSettings();
  const redirect = buildContactMailto(payload, settings.contactEmail);
  return NextResponse.json({ ok: true as const, redirect });
}

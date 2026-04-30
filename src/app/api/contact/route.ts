import { NextResponse } from "next/server";

import { NOYA_CONTACT_EMAIL } from "@/lib/contact-email";

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

function buildContactMailto(payload: ForwardPayload): string {
  const topicLine = payload.topic ? `Sujet : ${payload.topic}\n` : "";
  const companyLine = payload.company ? `Organisation : ${payload.company}\n` : "";
  const phoneLine = payload.phone ? `Téléphone : ${payload.phone}\n` : "";
  const body =
    `${topicLine}${companyLine}${phoneLine}\n---\n\n${payload.message}\n\n—\n${payload.name}\n${payload.email}`;
  const subject = payload.topic
    ? `[Site Noya] ${payload.topic} — ${payload.name}`
    : `[Site Noya] Contact — ${payload.name}`;

  let href = `mailto:${NOYA_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (href.length > MAILTO_MAX_LEN) {
    const suffix = "\n\n[Message tronqué — renvoyez la suite par un second email si besoin.]";
    let trimmed = body;
    while (
      `mailto:${NOYA_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(trimmed + suffix)}`.length >
        MAILTO_MAX_LEN && trimmed.length > 200
    ) {
      trimmed = trimmed.slice(0, Math.floor(trimmed.length * 0.85));
    }
    href = `mailto:${NOYA_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(trimmed + suffix)}`;
  }
  return href;
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
    company: company && company.length > 0 ? company : null,
    phone: phone && phone.length > 0 ? phone : null,
    topic: topic && topic.length > 0 ? topic : null,
  };

  const redirect = buildContactMailto(payload);
  // #region agent log
  fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "1de7f5" },
    body: JSON.stringify({
      sessionId: "1de7f5",
      runId: "pre-fix",
      hypothesisId: "H1,H2,H3",
      location: "contact/route.ts:POST:redirect-built",
      message: "Contact redirect generated",
      data: {
        recipient: NOYA_CONTACT_EMAIL,
        usesMailto: redirect.startsWith("mailto:"),
        redirectPreview: redirect.slice(0, 160),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  return NextResponse.json({ ok: true as const, redirect });
}

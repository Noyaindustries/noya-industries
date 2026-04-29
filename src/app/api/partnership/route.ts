import { NextResponse } from "next/server";

import { NOYA_CONTACT_EMAIL } from "@/lib/contact-email";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MAILTO_MAX_LEN = 1950;
const WEBHOOK_RETRY_MS = 1800;

type ForwardPayload = {
  workType: "partenaire" | "investisseur";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  referral: string;
  partnerType: string;
  sector: string;
  partnerDescription: string;
  investorProfile: string;
  investorTicket: string;
  investorDescription: string;
  interests: string[];
};

function buildPartnershipMailto(payload: ForwardPayload): string {
  const name = `${payload.firstName} ${payload.lastName}`.trim();
  const mode =
    payload.workType === "partenaire" ? "Partenariat" : "Investisseur / startup studio";
  const lines: string[] = [
    `Type de demande : ${mode}`,
    "",
    `Nom : ${name}`,
    `Email : ${payload.email}`,
    `Téléphone : ${payload.phone || "—"}`,
    `Organisation : ${payload.company}`,
    `Pays : ${payload.country}`,
  ];
  if (payload.referral) lines.push(`Référence / parrain : ${payload.referral}`);
  lines.push("");
  if (payload.workType === "partenaire") {
    lines.push(`Type de partenariat : ${payload.partnerType}`);
    if (payload.sector) lines.push(`Secteur : ${payload.sector}`);
    lines.push("", "Description :", payload.partnerDescription);
  } else {
    lines.push(`Profil investisseur : ${payload.investorProfile}`);
    if (payload.investorTicket) lines.push(`Ticket : ${payload.investorTicket}`);
    lines.push(`Entités d'intérêt : ${payload.interests.join(", ") || "—"}`);
    lines.push("", "Approche / description :", payload.investorDescription);
  }
  const body = lines.join("\n");
  const subject = `[Site Noya] ${mode} — ${payload.company}`;
  let href = `mailto:${NOYA_CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  if (href.length > MAILTO_MAX_LEN) {
    const suffix = "\n\n[Suite tronquée — complétez par un second email si besoin.]";
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

async function postToInfiniteCore(payload: ForwardPayload): Promise<Response> {
  const endpoint =
    process.env.INFINITECORE_RECRUTEMENT_WEBHOOK_URL ??
    "https://infinitecore.net/api/webhooks/noya-recrutement";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
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

  return fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(requestBody),
  });
}

function jsonErrorFromResponse(
  res: Response,
  details: unknown,
): { error: string; details?: unknown } {
  const errorFromDetails =
    details && typeof details === "object" && "error" in details
      ? (details as Record<string, unknown>).error
      : undefined;
  return {
    error:
      typeof errorFromDetails === "string"
        ? errorFromDetails
        : "Webhook Infinite Core a refusé la requête.",
    details,
  };
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
  const workType = b.workType === "investisseur" ? "investisseur" : "partenaire";
  const firstName = typeof b.firstName === "string" ? b.firstName.trim() : "";
  const lastName = typeof b.lastName === "string" ? b.lastName.trim() : "";
  const email = typeof b.email === "string" ? b.email.trim() : "";
  const phone = typeof b.phone === "string" ? b.phone.trim() : "";
  const company = typeof b.company === "string" ? b.company.trim() : "";
  const country = typeof b.country === "string" ? b.country.trim() : "";
  const referral = typeof b.referral === "string" ? b.referral.trim() : "";
  const partnerType = typeof b.partnerType === "string" ? b.partnerType.trim() : "";
  const sector = typeof b.sector === "string" ? b.sector.trim() : "";
  const partnerDescription =
    typeof b.partnerDescription === "string" ? b.partnerDescription.trim() : "";
  const investorProfile =
    typeof b.investorProfile === "string" ? b.investorProfile.trim() : "";
  const investorTicket = typeof b.investorTicket === "string" ? b.investorTicket.trim() : "";
  const investorDescription =
    typeof b.investorDescription === "string" ? b.investorDescription.trim() : "";
  const interests = Array.isArray(b.interests)
    ? b.interests.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    : [];

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "Le prénom et le nom sont requis." }, { status: 400 });
  }
  if (!email || !emailRe.test(email)) {
    return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
  }
  if (!company) {
    return NextResponse.json(
      { error: "L'entreprise / organisation est requise." },
      { status: 400 },
    );
  }
  if (!country) {
    return NextResponse.json({ error: "Le pays est requis." }, { status: 400 });
  }

  if (workType === "partenaire") {
    if (!partnerType || !partnerDescription) {
      return NextResponse.json(
        { error: "Complétez les informations de partenariat." },
        { status: 400 },
      );
    }
  } else if (!investorProfile || !investorDescription || interests.length === 0) {
    return NextResponse.json(
      { error: "Complétez les informations investisseur." },
      { status: 400 },
    );
  }

  const payload: ForwardPayload = {
    workType: workType as ForwardPayload["workType"],
    firstName,
    lastName,
    email,
    phone,
    company,
    country,
    referral,
    partnerType,
    sector,
    partnerDescription,
    investorProfile,
    investorTicket,
    investorDescription,
    interests,
  };

  try {
    let res = await postToInfiniteCore(payload);

    if (!res.ok && res.status === 429) {
      await new Promise((r) => setTimeout(r, WEBHOOK_RETRY_MS));
      res = await postToInfiniteCore(payload);
    }

    if (res.ok) {
      return NextResponse.json({ ok: true as const });
    }

    let details: unknown = null;
    try {
      details = await res.json();
    } catch {
      // ignore non-JSON response body
    }

    const status = res.status;
    if (status === 429 || status === 502 || status === 503 || status === 504) {
      return NextResponse.json({
        ok: true as const,
        redirect: buildPartnershipMailto(payload),
        fallbackMailto: true as const,
      });
    }

    const err = jsonErrorFromResponse(res, details);
    return NextResponse.json(err, { status: res.status });
  } catch {
    return NextResponse.json(
      {
        ok: true as const,
        redirect: buildPartnershipMailto(payload),
        fallbackMailto: true as const,
      },
      { status: 200 },
    );
  }
}

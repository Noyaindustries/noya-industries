import { NextResponse } from "next/server";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ForwardPayload = {
  webhookType: "partnership";
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

async function forwardToInfiniteCore(payload: ForwardPayload) {
  const endpoint =
    process.env.INFINITECORE_RECRUTEMENT_WEBHOOK_URL ??
    "https://infinitecore.net/api/webhooks/noya-recrutement";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const secret = process.env.NOYA_RECRUTEMENT_WEBHOOK_SECRET;
  if (secret && secret.trim().length > 0) {
    headers["X-Webhook-Secret"] = secret.trim();
  }

  const requestBody =
    secret && secret.trim().length > 0
      ? { ...payload, webhookSecret: secret.trim() }
      : payload;

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
    return NextResponse.json(
      {
        error: "Webhook Infinite Core a refusé la requête.",
        details,
      },
      { status: res.status },
    );
  }

  return NextResponse.json({ ok: true });
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

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Base de données non configurée (DATABASE_URL)." },
      { status: 503 },
    );
  }

  const payload: ForwardPayload = {
    webhookType: "partnership",
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

  // “forward uniquement” : aucune persistance côté Noya.
  return forwardToInfiniteCore(payload);
}

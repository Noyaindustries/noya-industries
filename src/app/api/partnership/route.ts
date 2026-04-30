import { NextResponse } from "next/server";
import { createHash } from "node:crypto";

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WEBHOOK_RETRY_MS = 1800;
const WEBHOOK_MAX_RETRIES = 3;
const DEFAULT_INFINITECORE_WEBHOOK_URL =
  "https://www.infinitecore.net/api/webhooks/noya-recrutement";

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

function buildIdempotencyKey(payload: ForwardPayload): string {
  const timeBucket = Math.floor(Date.now() / 10_000);
  const source = [
    payload.workType,
    payload.email.trim().toLowerCase(),
    payload.company.trim().toLowerCase(),
    payload.firstName.trim().toLowerCase(),
    payload.lastName.trim().toLowerCase(),
    String(timeBucket),
  ].join("|");

  return createHash("sha256").update(source).digest("hex");
}

function parseRetryAfterMs(retryAfter: string | null): number | null {
  if (!retryAfter) return null;

  const asSeconds = Number(retryAfter);
  if (Number.isFinite(asSeconds) && asSeconds > 0) {
    return Math.min(asSeconds * 1000, 15_000);
  }

  const asDate = Date.parse(retryAfter);
  if (!Number.isNaN(asDate)) {
    const delta = asDate - Date.now();
    if (delta > 0) return Math.min(delta, 15_000);
  }

  return null;
}

function isPartnershipDebugEnabled(): boolean {
  const raw = process.env.NOYA_PARTNERSHIP_DEBUG;
  if (!raw) return process.env.NODE_ENV !== "production";
  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function logPartnershipDebug(message: string, details?: Record<string, unknown>) {
  if (!isPartnershipDebugEnabled()) return;
  const prefix = "[partnership-api]";
  if (details) {
    console.info(`${prefix} ${message}`, details);
    return;
  }
  console.info(`${prefix} ${message}`);
}

async function postToInfiniteCore(payload: ForwardPayload): Promise<Response> {
  const endpoint = process.env.INFINITECORE_RECRUTEMENT_WEBHOOK_URL ?? DEFAULT_INFINITECORE_WEBHOOK_URL;

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

  const idempotencyKey = buildIdempotencyKey(payload);
  headers["X-Idempotency-Key"] = idempotencyKey;

  return fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

async function readResponseBody(res: Response): Promise<{ details: unknown; rawText: string }> {
  try {
    const text = await res.text();
    if (!text.trim()) return { details: null, rawText: "" };
    try {
      return { details: JSON.parse(text) as unknown, rawText: text };
    } catch {
      return { details: null, rawText: text };
    }
  } catch {
    return { details: null, rawText: "" };
  }
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
    const endpoint = process.env.INFINITECORE_RECRUTEMENT_WEBHOOK_URL ?? DEFAULT_INFINITECORE_WEBHOOK_URL;
    const webhookSecret = process.env.NOYA_RECRUTEMENT_WEBHOOK_SECRET?.trim() ?? "";
    let endpointHost = "invalid-endpoint";
    try {
      endpointHost = new URL(endpoint).host;
    } catch {
      endpointHost = "invalid-endpoint";
    }
    // #region agent log
    fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "1de7f5" },
      body: JSON.stringify({
        sessionId: "1de7f5",
        runId: "pre-fix",
        hypothesisId: "H1,H4,H5",
        location: "route.ts:POST:validated",
        message: "Partnership payload validated server-side",
        data: {
          workType: payload.workType,
          hasPartnerType: Boolean(payload.partnerType),
          hasPartnerDescription: Boolean(payload.partnerDescription),
          interestsCount: payload.interests.length,
          idempotencyKeyPrefix: buildIdempotencyKey(payload).slice(0, 12),
          endpointHost,
          hasWebhookSecret: webhookSecret.length > 0,
          hasCustomUserAgent: Boolean(process.env.NOYA_INFINITECORE_WEBHOOK_USER_AGENT?.trim()),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (webhookSecret.length === 0) {
      // #region agent log
      fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "1de7f5" },
        body: JSON.stringify({
          sessionId: "1de7f5",
          runId: "post-fix",
          hypothesisId: "H6",
          location: "route.ts:POST:missing-webhook-secret",
          message: "Webhook secret missing, aborting upstream call",
          data: { endpointHost },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return NextResponse.json(
        {
          error:
            "Configuration manquante: NOYA_RECRUTEMENT_WEBHOOK_SECRET. Ajoutez cette variable d'environnement pour activer l'envoi du formulaire partenaire.",
        },
        { status: 503 },
      );
    }
    logPartnershipDebug("incoming request validated", {
      workType: payload.workType,
      emailHash: createHash("sha256")
        .update(payload.email.trim().toLowerCase())
        .digest("hex")
        .slice(0, 12),
      company: payload.company,
    });

    let res = await postToInfiniteCore(payload);
    let attempts = 1;
    // #region agent log
    fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "1de7f5" },
      body: JSON.stringify({
        sessionId: "1de7f5",
        runId: "pre-fix",
        hypothesisId: "H1,H2",
        location: "route.ts:POST:upstream-first-response",
        message: "Received first upstream response",
        data: { status: res.status, retryAfter: res.headers.get("Retry-After") },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    logPartnershipDebug("upstream response", {
      attempt: attempts,
      status: res.status,
      retryAfter: res.headers.get("Retry-After"),
    });

    while (!res.ok && res.status === 429 && attempts < WEBHOOK_MAX_RETRIES) {
      const waitMs = parseRetryAfterMs(res.headers.get("Retry-After")) ?? WEBHOOK_RETRY_MS;
      logPartnershipDebug("upstream returned 429, retrying", {
        attempt: attempts,
        nextAttemptInMs: waitMs,
      });
      await new Promise((r) => setTimeout(r, waitMs));
      res = await postToInfiniteCore(payload);
      attempts += 1;
      // #region agent log
      fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "1de7f5" },
        body: JSON.stringify({
          sessionId: "1de7f5",
          runId: "pre-fix",
          hypothesisId: "H1,H2,H5",
          location: "route.ts:POST:upstream-retry-response",
          message: "Received upstream response after retry",
          data: { attempt: attempts, status: res.status, retryAfter: res.headers.get("Retry-After") },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      logPartnershipDebug("upstream response", {
        attempt: attempts,
        status: res.status,
        retryAfter: res.headers.get("Retry-After"),
      });
    }

    const { details, rawText } = await readResponseBody(res);
    // #region agent log
    fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "1de7f5" },
      body: JSON.stringify({
        sessionId: "1de7f5",
        runId: "pre-fix",
        hypothesisId: "H6,H7,H8",
        location: "route.ts:POST:upstream-details",
        message: "Parsed upstream payload details",
        data: {
          status: res.status,
          hasJsonDetails: details !== null,
          detailKeys:
            details && typeof details === "object" ? Object.keys(details as Record<string, unknown>).slice(0, 6) : [],
          detailError:
            details && typeof details === "object" && "error" in details
              ? (details as Record<string, unknown>).error
              : null,
          checkpointDetected:
            res.status === 429 &&
            rawText.toLowerCase().includes("vercel security checkpoint"),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const upstreamReportsFailure =
      details !== null &&
      typeof details === "object" &&
      "success" in details &&
      (details as Record<string, unknown>).success === false;

    if (res.ok && !upstreamReportsFailure) {
      return NextResponse.json({ ok: true as const });
    }

    const checkpointDetected =
      res.status === 429 && rawText.toLowerCase().includes("vercel security checkpoint");
    if (checkpointDetected) {
      return NextResponse.json(
        {
          error:
            "Le webhook Infinite Core est bloqué par Vercel Security Checkpoint (protection anti-bot). Autorisez l'appel serveur à cette route ou désactivez la protection pour ce webhook.",
        },
        { status: 503 },
      );
    }

    const status = res.status || 502;
    const err = jsonErrorFromResponse(res, details);
    const httpStatus = status >= 400 && status < 600 ? status : 502;
    // #region agent log
    fetch("http://127.0.0.1:27772/ingest/e1c26ee0-a4a1-4c3b-b97f-b40a309d9f43", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "1de7f5" },
      body: JSON.stringify({
        sessionId: "1de7f5",
        runId: "pre-fix",
        hypothesisId: "H1,H2,H4",
        location: "route.ts:POST:return-error",
        message: "Returning partnership API error",
        data: { upstreamStatus: status, httpStatus, error: err.error, attempts },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    logPartnershipDebug("returning error response", {
      upstreamStatus: status,
      httpStatus,
      upstreamReportsFailure,
    });
    return NextResponse.json(err, { status: httpStatus });
  } catch {
    logPartnershipDebug("unhandled exception during upstream relay");
    return NextResponse.json(
      {
        error:
          "Impossible de joindre le service d'enregistrement des demandes. Vérifiez votre connexion ou réessayez plus tard.",
      },
      { status: 502 },
    );
  }
}

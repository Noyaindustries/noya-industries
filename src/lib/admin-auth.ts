export const ADMIN_SESSION_COOKIE = "noya_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 2 * 60 * 60;
const SESSION_VERSION = "v2";
const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_KEY_LENGTH = 32;
const SESSION_CLOCK_SKEW_SECONDS = 30;

function bufferToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array<ArrayBuffer> {
  if (!/^[a-f0-9]+$/i.test(hex) || hex.length % 2 !== 0) {
    return new Uint8Array();
  }
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map((pair) => parseInt(pair, 16)));
}

function getAdminSessionSecret(): string | null {
  const dedicatedSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (dedicatedSecret && dedicatedSecret.length >= 32) return dedicatedSecret;

  const passwordFallback = getConfiguredAdminPassword();
  const databaseSecret = process.env.DATABASE_URL?.trim();
  if (passwordFallback && databaseSecret) {
    return `${passwordFallback}\u0000${databaseSecret}`;
  }
  if (passwordFallback && passwordFallback.length >= 12) return passwordFallback;
  return null;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signSessionPayload(payload: string, secret: string): Promise<string> {
  const signature = await crypto.subtle.sign(
    "HMAC",
    await importHmacKey(secret),
    new TextEncoder().encode(payload),
  );
  return bufferToHex(new Uint8Array(signature));
}

async function verifySessionSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  const signatureBytes = hexToBuffer(signature);
  if (signatureBytes.length !== 32) return false;
  return await crypto.subtle.verify(
    "HMAC",
    await importHmacKey(secret),
    signatureBytes,
    new TextEncoder().encode(payload),
  );
}

export function timingSafeStringEqual(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
}

export function getConfiguredAdminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value && value.length > 0 ? value : null;
}

export function isStrongAdminPassword(password: string): boolean {
  return (
    password.length >= 12 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    PBKDF2_KEY_LENGTH * 8,
  );
  return `pbkdf2:${PBKDF2_ITERATIONS}:${bufferToHex(salt)}:${bufferToHex(new Uint8Array(bits))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;

  const iterations = Number.parseInt(parts[1] ?? "", 10);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const salt = hexToBuffer(parts[2] ?? "");
  const expectedHash = parts[3] ?? "";
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    PBKDF2_KEY_LENGTH * 8,
  );
  return timingSafeStringEqual(bufferToHex(new Uint8Array(bits)), expectedHash);
}

export async function buildAdminSessionValue(
  adminId: string,
  nowMs = Date.now(),
): Promise<string> {
  const secret = getAdminSessionSecret();
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET doit contenir au moins 32 caractères.",
    );
  }

  const expiresAt = Math.floor(nowMs / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const nonce = new Uint8Array(16);
  crypto.getRandomValues(nonce);
  const payload = `${SESSION_VERSION}.${adminId}.${expiresAt}.${bufferToHex(nonce)}`;
  return `${payload}.${await signSessionPayload(payload, secret)}`;
}

export function parseAdminSessionValue(
  value: string | undefined,
): { adminId: string; expiresAt: number; nonce: string; signature: string } | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 5 || parts[0] !== SESSION_VERSION) return null;

  const adminId = parts[1] ?? "";
  const expiresAt = Number.parseInt(parts[2] ?? "", 10);
  const nonce = parts[3] ?? "";
  const signature = parts[4] ?? "";
  if (
    !/^[a-zA-Z0-9_-]+$/.test(adminId) ||
    !Number.isSafeInteger(expiresAt) ||
    !/^[a-f0-9]{32}$/i.test(nonce) ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return null;
  }

  return {
    adminId,
    expiresAt,
    nonce,
    signature,
  };
}

export async function verifyAdminSessionValue(
  value: string | undefined,
  nowMs = Date.now(),
): Promise<string | null> {
  const parsed = parseAdminSessionValue(value);
  if (!parsed) return null;

  const nowSeconds = Math.floor(nowMs / 1000);
  if (
    parsed.expiresAt < nowSeconds - SESSION_CLOCK_SKEW_SECONDS ||
    parsed.expiresAt >
      nowSeconds + ADMIN_SESSION_TTL_SECONDS + SESSION_CLOCK_SKEW_SECONDS
  ) {
    return null;
  }

  const secret = getAdminSessionSecret();
  if (!secret) return null;
  const payload = `${SESSION_VERSION}.${parsed.adminId}.${parsed.expiresAt}.${parsed.nonce}`;
  return (await verifySessionSignature(payload, parsed.signature, secret))
    ? parsed.adminId
    : null;
}

export async function buildLegacyAdminSessionValue(password: string): Promise<string> {
  if (!timingSafeStringEqual(password, getConfiguredAdminPassword() ?? "")) {
    throw new Error("Mot de passe administrateur invalide.");
  }
  return await buildAdminSessionValue("legacy");
}

export async function verifyLegacyAdminSessionValue(
  value: string | undefined,
  password: string,
): Promise<boolean> {
  if (!timingSafeStringEqual(password, getConfiguredAdminPassword() ?? "")) {
    return false;
  }
  return (await verifyAdminSessionValue(value)) === "legacy";
}

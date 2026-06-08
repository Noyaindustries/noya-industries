export const ADMIN_SESSION_COOKIE = "noya_admin_session";
const ADMIN_TOKEN_SALT = "noya-admin-v1";
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_LENGTH = 32;

function bufferToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuffer(hex: string): Uint8Array<ArrayBuffer> {
  const pairs = hex.match(/.{1,2}/g) ?? [];
  return new Uint8Array(pairs.map((pair) => parseInt(pair, 16)));
}

export async function buildAdminToken(subject: string): Promise<string> {
  const input = `${subject}|${ADMIN_TOKEN_SALT}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return bufferToHex(new Uint8Array(digest));
}

export function getConfiguredAdminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value && value.length > 0 ? value : null;
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
  return bufferToHex(new Uint8Array(bits)) === expectedHash;
}

export function buildAdminSessionValue(adminId: string, token: string): string {
  return `${adminId}.${token}`;
}

export function parseAdminSessionValue(value: string | undefined): { adminId: string; token: string } | null {
  if (!value) return null;
  const separatorIndex = value.indexOf(".");
  if (separatorIndex <= 0 || separatorIndex >= value.length - 1) return null;
  return {
    adminId: value.slice(0, separatorIndex),
    token: value.slice(separatorIndex + 1),
  };
}

export async function verifyAdminSessionValue(value: string | undefined): Promise<string | null> {
  const parsed = parseAdminSessionValue(value);
  if (!parsed) return null;
  const expectedToken = await buildAdminToken(parsed.adminId);
  return parsed.token === expectedToken ? parsed.adminId : null;
}

export async function buildLegacyAdminSessionValue(password: string): Promise<string> {
  return `legacy.${await buildAdminToken(password)}`;
}

export async function verifyLegacyAdminSessionValue(
  value: string | undefined,
  password: string,
): Promise<boolean> {
  const parsed = parseAdminSessionValue(value);
  if (!parsed || parsed.adminId !== "legacy") return false;
  return parsed.token === (await buildAdminToken(password));
}

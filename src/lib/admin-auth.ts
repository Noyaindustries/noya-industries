export const ADMIN_SESSION_COOKIE = "noya_admin_session";
const ADMIN_TOKEN_SALT = "noya-admin-v1";

export async function buildAdminToken(password: string): Promise<string> {
  const input = `${password}|${ADMIN_TOKEN_SALT}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

export function getConfiguredAdminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value && value.length > 0 ? value : null;
}


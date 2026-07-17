import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  getConfiguredAdminPassword,
  verifyAdminSessionValue,
  verifyLegacyAdminSessionValue,
} from "@/lib/admin-auth";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function isSameOriginMutation(request: NextRequest): boolean {
  if (SAFE_METHODS.has(request.method)) return true;

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;

  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  return origin === request.nextUrl.origin;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isDashboardPath = pathname.startsWith("/dashboard");
  const isDashboardApiPath = pathname.startsWith("/api/dashboard");
  const isAdminLoginPath = pathname === "/admin-login";
  const isAdminApiPath = pathname.startsWith("/api/admin");
  const isAdminLoginApiPath = pathname === "/api/admin/login";
  const isAdminLogoutApiPath = pathname === "/api/admin/logout";

  if (
    !isDashboardPath &&
    !isDashboardApiPath &&
    !isAdminLoginPath &&
    !isAdminApiPath
  ) {
    return NextResponse.next();
  }

  if (
    (isDashboardApiPath || isAdminApiPath) &&
    !isSameOriginMutation(request)
  ) {
    return NextResponse.json(
      { error: "Origine de requête non autorisée." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const configuredPassword = getConfiguredAdminPassword();
  const adminId = await verifyAdminSessionValue(sessionToken);
  const isLegacyAuthenticated =
    configuredPassword !== null &&
    (await verifyLegacyAdminSessionValue(sessionToken, configuredPassword));
  const isAuthenticated = Boolean(adminId) || isLegacyAuthenticated;

  const requiresAuthentication =
    isDashboardPath || isDashboardApiPath || isAdminLogoutApiPath;

  if (requiresAuthentication && !isAuthenticated) {
    if (isDashboardApiPath || isAdminLogoutApiPath) {
      return NextResponse.json(
        { error: "Authentification admin requise." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }
    const loginUrl = new URL("/admin-login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if ((isAdminLoginPath || isAdminLoginApiPath) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/dashboard/:path*",
    "/api/admin/:path*",
    "/admin-login",
  ],
};

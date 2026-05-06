import { NextResponse, type NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  buildAdminToken,
  getConfiguredAdminPassword,
} from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isDashboardPath = pathname.startsWith("/dashboard");
  const isDashboardApiPath = pathname.startsWith("/api/dashboard");
  const isAdminLoginPath = pathname === "/admin-login";

  if (!isDashboardPath && !isDashboardApiPath && !isAdminLoginPath) {
    return NextResponse.next();
  }

  const configuredPassword = getConfiguredAdminPassword();
  if (!configuredPassword) {
    if (isAdminLoginPath) return NextResponse.next();
    return NextResponse.redirect(new URL("/admin-login?error=config", request.url));
  }

  const expectedToken = await buildAdminToken(configuredPassword);
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isAuthenticated = sessionToken === expectedToken;

  if ((isDashboardPath || isDashboardApiPath) && !isAuthenticated) {
    if (isDashboardApiPath) {
      return NextResponse.json({ error: "Authentification admin requise." }, { status: 401 });
    }
    const loginUrl = new URL("/admin-login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminLoginPath && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*", "/admin-login"],
};


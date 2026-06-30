import { NextResponse } from "next/server";

import NextAuth from "next-auth";

import authConfig from "@/auth.config";

// Edge-safe auth instance (no Prisma adapter, JWT session only).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const path = nextUrl.pathname;
  const isOnDashboard = path.startsWith("/dashboard");
  const isOnAdmin = path.startsWith("/admin");
  const isOnLogin = path === "/login" || path.startsWith("/login/");

  // Gate the app behind auth. The username -> /onboarding check (dashboard) and
  // the ADMIN role check (admin) both live in their layouts (server,
  // DB-truthful) since the JWT can't see the DB here.
  if ((isOnDashboard || isOnAdmin) && !isLoggedIn) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // Authenticated users shouldn't sit on the login pages.
  if (isOnLogin && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/login/:path*"],
};

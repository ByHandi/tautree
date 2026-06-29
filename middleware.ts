import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import authConfig from "@/auth.config";

// Edge-safe auth instance (no Prisma adapter, JWT session only).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const path = nextUrl.pathname;
  const isOnDashboard = path.startsWith("/dashboard");
  const isOnLogin = path === "/login" || path.startsWith("/login/");

  // Gate the app behind auth. The username -> /onboarding check lives in the
  // dashboard layout (server, DB-truthful) since the JWT can't see the DB here.
  if (isOnDashboard && !isLoggedIn) {
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
  matcher: ["/dashboard/:path*", "/login", "/login/:path*"],
};

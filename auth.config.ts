import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-safe Auth.js config.
 *
 * Only providers/callbacks that can run on the Edge runtime live here so it can
 * be imported by `middleware.ts`. The Prisma adapter and the Nodemailer (email)
 * provider are Node-only and are added in `auth.ts`.
 *
 * Google's client id/secret are read automatically from AUTH_GOOGLE_ID and
 * AUTH_GOOGLE_SECRET.
 */
export default {
  providers: [Google],
  // Self-hosted behind a reverse proxy: trust the forwarded host header so
  // Auth.js doesn't reject requests with UntrustedHost. Can also be enabled via
  // the AUTH_TRUST_HOST env var.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check",
    error: "/login",
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      // On sign-in, `user` is the AdapterUser from the database.
      if (user) {
        token.id = user.id;
        token.username = (user as { username?: string | null }).username ?? null;
      }
      // After onboarding sets the username we refresh the token via update().
      if (trigger === "update" && session?.username) {
        token.username = session.username as string;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      session.user.username = (token.username as string | null) ?? null;
      return session;
    },
  },
} satisfies NextAuthConfig;

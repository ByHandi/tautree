import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";

import authConfig from "@/auth.config";
import { db } from "@/lib/db";

/**
 * Full Auth.js instance (Node runtime). Combines the edge-safe config with the
 * Prisma adapter and the Nodemailer email (magic link) provider.
 *
 * Session strategy stays JWT (see auth.config.ts) so middleware can authorize on
 * the Edge without a DB round-trip; the adapter still persists users, accounts
 * and the email verification tokens.
 */
// Only register the email provider once SMTP is configured — Nodemailer throws
// at init without a `server`, which would otherwise break the build/CI.
const emailProvider = process.env.EMAIL_SERVER
  ? [
      Nodemailer({
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM,
      }),
    ]
  : [];

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [...authConfig.providers, ...emailProvider],
});

"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

/** Start the Google OAuth flow. Throws a redirect on success (expected). */
export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}

export type EmailState = { error?: string } | undefined;

/** Send a magic-link email. Redirects to /login/check on success. */
export async function signInWithEmail(_prev: EmailState, formData: FormData): Promise<EmailState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Masukkan alamat email yang valid." };
  }

  try {
    await signIn("nodemailer", { email, redirectTo: "/dashboard" });
  } catch (error) {
    // A successful signIn throws NEXT_REDIRECT — let it propagate.
    if (error instanceof AuthError) {
      return { error: "Gagal mengirim email. Coba lagi." };
    }
    throw error;
  }
  return undefined;
}

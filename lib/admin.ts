import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";

/**
 * DB-truthful admin gate. The JWT session never carries the role, so authority
 * is always read fresh from the database — used by the admin layout and every
 * admin server action. Non-admins are bounced: unauthenticated → /login,
 * authenticated-but-not-admin → /dashboard.
 *
 * Returns the verified admin's user id.
 */
export async function requireAdmin(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/dashboard");

  return session.user.id;
}

/** Lightweight check for conditional UI (e.g. the sidebar Admin link). */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

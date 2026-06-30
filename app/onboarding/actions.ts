"use server";

import { redirect } from "next/navigation";

import { auth, unstable_update } from "@/auth";
import { db } from "@/lib/db";
import { normalizeUsername, validateUsername } from "@/lib/username";

export type ClaimState = { error?: string } | undefined;

export async function claimUsername(_prev: ClaimState, formData: FormData): Promise<ClaimState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const username = normalizeUsername(String(formData.get("username") ?? ""));

  const valid = validateUsername(username);
  if (!valid.ok) return { error: valid.reason };

  const existing = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (existing && existing.id !== session.user.id) {
    return { error: "Username already taken." };
  }

  try {
    await db.user.update({ where: { id: session.user.id }, data: { username } });
  } catch {
    return { error: "Couldn't save. Please try again." };
  }

  // Refresh the JWT so session.user.username reflects the claim immediately.
  await unstable_update({ user: { username } } as never);

  redirect("/dashboard");
}

"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

export type AdminActionState = { error?: string; ok?: boolean };

/** Suspend or un-suspend a user's public page. Admins can't suspend themselves. */
export async function setSuspended(userId: string, suspended: boolean): Promise<AdminActionState> {
  const adminId = await requireAdmin();
  if (userId === adminId) return { error: "You can't suspend your own account." };

  try {
    const updated = await db.user.update({
      where: { id: userId },
      data: { suspended },
      select: { username: true },
    });
    revalidatePath("/admin");
    revalidatePath(`/admin/users/${userId}`);
    if (updated.username) revalidatePath(`/${updated.username}`);
  } catch {
    return { error: "Couldn't update the user." };
  }
  return { ok: true };
}

/** Permanently delete a user (cascades to links, clicks, sessions, accounts). */
export async function deleteUser(userId: string): Promise<AdminActionState> {
  const adminId = await requireAdmin();
  if (userId === adminId) return { error: "You can't delete your own account." };

  try {
    const deleted = await db.user.delete({
      where: { id: userId },
      select: { username: true },
    });
    revalidatePath("/admin");
    if (deleted.username) revalidatePath(`/${deleted.username}`);
  } catch {
    return { error: "Couldn't delete the user." };
  }
  return { ok: true };
}

/** Delete any user's link (admin scope — not owner-restricted). */
export async function deleteLinkAsAdmin(linkId: string): Promise<AdminActionState> {
  await requireAdmin();

  try {
    const deleted = await db.link.delete({
      where: { id: linkId },
      select: { userId: true, user: { select: { username: true } } },
    });
    revalidatePath(`/admin/users/${deleted.userId}`);
    if (deleted.user.username) revalidatePath(`/${deleted.user.username}`);
  } catch {
    return { error: "Couldn't delete the link." };
  }
  return { ok: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeUrl, validateTitle } from "@/lib/links";

export type LinkFormState = { error?: string; ok?: boolean } | undefined;

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

function revalidate() {
  revalidatePath("/dashboard/links");
  revalidatePath("/dashboard");
}

export async function createLink(
  _prev: LinkFormState,
  formData: FormData,
): Promise<LinkFormState> {
  const userId = await requireUserId();

  const title = validateTitle(String(formData.get("title") ?? ""));
  if (!title.ok) return { error: title.reason };
  const url = normalizeUrl(String(formData.get("url") ?? ""));
  if (!url.ok) return { error: url.reason };

  // Append the new link at the end of the list.
  const last = await db.link.findFirst({
    where: { userId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = (last?.order ?? -1) + 1;

  try {
    await db.link.create({
      data: { userId, title: String(formData.get("title")).trim(), url: url.url, order },
    });
  } catch {
    return { error: "Couldn't save. Please try again." };
  }

  revalidate();
  return { ok: true };
}

export async function updateLink(
  _prev: LinkFormState,
  formData: FormData,
): Promise<LinkFormState> {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Link not found." };

  const title = validateTitle(String(formData.get("title") ?? ""));
  if (!title.ok) return { error: title.reason };
  const url = normalizeUrl(String(formData.get("url") ?? ""));
  if (!url.ok) return { error: url.reason };

  // updateMany scopes the write to the owner — no cross-user edits.
  const res = await db.link.updateMany({
    where: { id, userId },
    data: { title: String(formData.get("title")).trim(), url: url.url },
  });
  if (res.count === 0) return { error: "Link not found." };

  revalidate();
  return { ok: true };
}

export async function toggleLink(id: string, isActive: boolean): Promise<void> {
  const userId = await requireUserId();
  await db.link.updateMany({ where: { id, userId }, data: { isActive } });
  revalidate();
}

export async function deleteLink(id: string): Promise<void> {
  const userId = await requireUserId();
  await db.link.deleteMany({ where: { id, userId } });
  revalidate();
}

/**
 * Persist a full reordering. `orderedIds` is the new top-to-bottom order; we
 * write each link's `order` to its index. Scoped to the owner's links — ids
 * that aren't theirs are ignored by the `userId` filter.
 */
export async function reorderLinks(orderedIds: string[]): Promise<void> {
  const userId = await requireUserId();

  const owned = await db.link.findMany({
    where: { userId },
    select: { id: true },
  });
  const ownedIds = new Set(owned.map((l) => l.id));

  // Only reorder ids we actually own, preserving the requested sequence.
  const ids = orderedIds.filter((id) => ownedIds.has(id));
  if (ids.length === 0) return;

  await db.$transaction(
    ids.map((id, index) =>
      db.link.update({ where: { id }, data: { order: index } }),
    ),
  );

  revalidate();
}

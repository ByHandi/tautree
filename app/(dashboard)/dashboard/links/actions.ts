"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeUrl, parseLinkKind, parseSchedule, validateTitle } from "@/lib/links";

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

export async function createLink(_prev: LinkFormState, formData: FormData): Promise<LinkFormState> {
  const userId = await requireUserId();

  const kind = parseLinkKind(String(formData.get("type") ?? ""));
  const title = validateTitle(String(formData.get("title") ?? ""));
  if (!title.ok) return { error: title.reason };
  // Headers are section labels with no destination; only links carry a URL.
  let url: string | null = null;
  if (kind === "LINK") {
    const parsed = normalizeUrl(String(formData.get("url") ?? ""));
    if (!parsed.ok) return { error: parsed.reason };
    url = parsed.url;
  }
  const schedule = parseSchedule(
    String(formData.get("startsAt") ?? ""),
    String(formData.get("endsAt") ?? ""),
  );
  if (!schedule.ok) return { error: schedule.reason };

  // Append the new link at the end of the list.
  const last = await db.link.findFirst({
    where: { userId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = (last?.order ?? -1) + 1;

  try {
    await db.link.create({
      data: {
        userId,
        type: kind,
        title: String(formData.get("title")).trim(),
        url,
        order,
        startsAt: schedule.startsAt,
        endsAt: schedule.endsAt,
      },
    });
  } catch {
    return { error: "Couldn't save. Please try again." };
  }

  revalidate();
  return { ok: true };
}

export async function updateLink(_prev: LinkFormState, formData: FormData): Promise<LinkFormState> {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Link not found." };

  const kind = parseLinkKind(String(formData.get("type") ?? ""));
  const title = validateTitle(String(formData.get("title") ?? ""));
  if (!title.ok) return { error: title.reason };
  let url: string | null = null;
  if (kind === "LINK") {
    const parsed = normalizeUrl(String(formData.get("url") ?? ""));
    if (!parsed.ok) return { error: parsed.reason };
    url = parsed.url;
  }
  const schedule = parseSchedule(
    String(formData.get("startsAt") ?? ""),
    String(formData.get("endsAt") ?? ""),
  );
  if (!schedule.ok) return { error: schedule.reason };

  // updateMany scopes the write to the owner — no cross-user edits.
  const res = await db.link.updateMany({
    where: { id, userId },
    data: {
      type: kind,
      title: String(formData.get("title")).trim(),
      url,
      startsAt: schedule.startsAt,
      endsAt: schedule.endsAt,
    },
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
    ids.map((id, index) => db.link.update({ where: { id }, data: { order: index } })),
  );

  revalidate();
}

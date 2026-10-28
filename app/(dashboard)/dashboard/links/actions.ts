"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { canEmbed } from "@/lib/embed";
import {
  normalizeUrl,
  parseLinkKind,
  parseSchedule,
  parseThumbnail,
  validateTitle,
} from "@/lib/links";

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

/** A text form field, or "" when it's missing. */
function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}

/**
 * Validate the create/edit form shared by `createLink` and `updateLink`. The
 * first failing check's message wins: title, URL (+ embed provider), schedule,
 * thumbnail — in that order.
 */
function parseLinkForm(formData: FormData) {
  const kind = parseLinkKind(field(formData, "type"));
  const title = validateTitle(field(formData, "title"));
  if (!title.ok) return { ok: false as const, error: title.reason };
  // Headers are section labels with no destination; links and embeds carry a
  // URL (embeds must be from a supported provider).
  let url: string | null = null;
  if (kind !== "HEADER") {
    const parsed = normalizeUrl(field(formData, "url"));
    if (!parsed.ok) return { ok: false as const, error: parsed.reason };
    if (kind === "EMBED" && !canEmbed(parsed.url)) {
      return { ok: false as const, error: "Only YouTube and Spotify links can be embedded." };
    }
    url = parsed.url;
  }
  const schedule = parseSchedule(field(formData, "startsAt"), field(formData, "endsAt"));
  if (!schedule.ok) return { ok: false as const, error: schedule.reason };
  const thumb = parseThumbnail(field(formData, "thumbnail"));
  if (!thumb.ok) return { ok: false as const, error: thumb.reason };

  return {
    ok: true as const,
    data: {
      type: kind,
      title: String(formData.get("title")).trim(),
      url,
      // Thumbnails and featuring only apply to plain links.
      thumbnail: kind === "LINK" ? thumb.thumbnail : null,
      featured: kind === "LINK" && formData.get("featured") === "on",
      startsAt: schedule.startsAt,
      endsAt: schedule.endsAt,
    },
  };
}

export async function createLink(_prev: LinkFormState, formData: FormData): Promise<LinkFormState> {
  const userId = await requireUserId();

  const form = parseLinkForm(formData);
  if (!form.ok) return { error: form.error };

  // Append the new link at the end of the list.
  const last = await db.link.findFirst({
    where: { userId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const order = (last?.order ?? -1) + 1;

  try {
    await db.link.create({ data: { userId, ...form.data, order } });
  } catch {
    return { error: "Couldn't save. Please try again." };
  }

  revalidate();
  return { ok: true };
}

export async function updateLink(_prev: LinkFormState, formData: FormData): Promise<LinkFormState> {
  const userId = await requireUserId();
  const id = field(formData, "id");
  if (!id) return { error: "Link not found." };

  const form = parseLinkForm(formData);
  if (!form.ok) return { error: form.error };

  // updateMany scopes the write to the owner — no cross-user edits.
  const res = await db.link.updateMany({ where: { id, userId }, data: form.data });
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

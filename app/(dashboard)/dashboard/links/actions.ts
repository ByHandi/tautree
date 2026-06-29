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
    return { error: "Gagal menyimpan. Coba lagi." };
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
  if (!id) return { error: "Link tidak ditemukan." };

  const title = validateTitle(String(formData.get("title") ?? ""));
  if (!title.ok) return { error: title.reason };
  const url = normalizeUrl(String(formData.get("url") ?? ""));
  if (!url.ok) return { error: url.reason };

  // updateMany scopes the write to the owner — no cross-user edits.
  const res = await db.link.updateMany({
    where: { id, userId },
    data: { title: String(formData.get("title")).trim(), url: url.url },
  });
  if (res.count === 0) return { error: "Link tidak ditemukan." };

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

/** Swap a link's order with its neighbour in the given direction. */
export async function moveLink(id: string, direction: "up" | "down"): Promise<void> {
  const userId = await requireUserId();

  const links = await db.link.findMany({
    where: { userId },
    orderBy: { order: "asc" },
    select: { id: true, order: true },
  });

  const index = links.findIndex((l) => l.id === id);
  if (index === -1) return;
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= links.length) return;

  const current = links[index];
  const neighbour = links[swapIndex];

  await db.$transaction([
    db.link.update({ where: { id: current.id }, data: { order: neighbour.order } }),
    db.link.update({ where: { id: neighbour.id }, data: { order: current.order } }),
  ]);

  revalidate();
}

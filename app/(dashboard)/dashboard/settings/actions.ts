"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeUrl } from "@/lib/links";
import { validateAvatarUrl, validateBio, validateName } from "@/lib/profile";
import { SOCIAL_MAX } from "@/lib/social";

export type ProfileFormState = { error?: string; ok?: boolean } | undefined;

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const name = validateName(String(formData.get("name") ?? ""));
  if (!name.ok) return { error: name.reason };

  const bio = validateBio(String(formData.get("bio") ?? ""));
  if (!bio.ok) return { error: bio.reason };

  const avatar = validateAvatarUrl(String(formData.get("avatarUrl") ?? ""));
  if (!avatar.ok) return { error: avatar.reason };

  let username: string | null;
  try {
    const updated = await db.user.update({
      where: { id: session.user.id },
      data: { name: name.name, bio: bio.bio, avatarUrl: avatar.url },
      select: { username: true },
    });
    username = updated.username;
  } catch {
    return { error: "Couldn't save. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  // Refresh the public page so the new name/bio/avatar show up immediately.
  if (username) revalidatePath(`/${username}`);

  return { ok: true };
}

async function revalidateSocials(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { username: true } });
  revalidatePath("/dashboard/settings");
  if (user?.username) revalidatePath(`/${user.username}`);
}

export type SocialFormState = { error?: string; ok?: boolean } | undefined;

export async function addSocial(
  _prev: SocialFormState,
  formData: FormData,
): Promise<SocialFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const parsed = normalizeUrl(String(formData.get("url") ?? ""));
  if (!parsed.ok) return { error: parsed.reason };

  const count = await db.socialLink.count({ where: { userId } });
  if (count >= SOCIAL_MAX) return { error: `You can add up to ${SOCIAL_MAX} social links.` };

  const last = await db.socialLink.findFirst({
    where: { userId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  try {
    await db.socialLink.create({
      data: { userId, url: parsed.url, order: (last?.order ?? -1) + 1 },
    });
  } catch {
    return { error: "Couldn't save. Please try again." };
  }

  await revalidateSocials(userId);
  return { ok: true };
}

export async function removeSocial(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  // deleteMany scopes to the owner — no cross-user deletes.
  await db.socialLink.deleteMany({ where: { id, userId: session.user.id } });
  await revalidateSocials(session.user.id);
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { validateAvatarUrl, validateBio, validateName } from "@/lib/profile";

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
    return { error: "Gagal menyimpan. Coba lagi." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  // Refresh the public page so the new name/bio/avatar show up immediately.
  if (username) revalidatePath(`/${username}`);

  return { ok: true };
}

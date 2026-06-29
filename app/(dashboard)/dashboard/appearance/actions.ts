"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { isThemeId } from "@/lib/themes";

export type ThemeFormState = { error?: string; ok?: boolean } | undefined;

export async function updateTheme(
  _prev: ThemeFormState,
  formData: FormData,
): Promise<ThemeFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const theme = String(formData.get("theme") ?? "");
  if (!isThemeId(theme)) return { error: "Tema tidak valid." };

  let username: string | null;
  try {
    const updated = await db.user.update({
      where: { id: session.user.id },
      data: { theme },
      select: { username: true },
    });
    username = updated.username;
  } catch {
    return { error: "Gagal menyimpan. Coba lagi." };
  }

  revalidatePath("/dashboard/appearance");
  if (username) revalidatePath(`/${username}`);

  return { ok: true };
}

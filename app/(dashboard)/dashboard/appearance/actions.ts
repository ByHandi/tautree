"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { parseButtonFill, parseButtonShape } from "@/lib/button-style";
import { db } from "@/lib/db";
import { Prisma } from "@/lib/generated/prisma/client";
import {
  CUSTOM_PALETTE_FIELDS,
  CUSTOM_THEME_ID,
  type CustomPalette,
  isThemeId,
  parseCustomPalette,
} from "@/lib/themes";

export type ThemeFormState = { error?: string; ok?: boolean } | undefined;

export async function updateTheme(
  _prev: ThemeFormState,
  formData: FormData,
): Promise<ThemeFormState> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const theme = String(formData.get("theme") ?? "");
  if (!isThemeId(theme)) return { error: "Invalid theme." };

  const buttonShape = parseButtonShape(String(formData.get("buttonShape") ?? ""));
  const buttonFill = parseButtonFill(String(formData.get("buttonFill") ?? ""));

  // For a custom theme, read + validate the palette; presets clear it.
  let customTheme: CustomPalette | null = null;
  if (theme === CUSTOM_THEME_ID) {
    const raw = Object.fromEntries(
      CUSTOM_PALETTE_FIELDS.map(({ key }) => [key, formData.get(key)]),
    );
    customTheme = parseCustomPalette(raw);
    if (!customTheme) return { error: "Invalid custom colors." };
  }

  let username: string | null;
  try {
    const updated = await db.user.update({
      where: { id: session.user.id },
      data: { theme, customTheme: customTheme ?? Prisma.DbNull, buttonShape, buttonFill },
      select: { username: true },
    });
    username = updated.username;
  } catch {
    return { error: "Couldn't save. Please try again." };
  }

  revalidatePath("/dashboard/appearance");
  if (username) revalidatePath(`/${username}`);

  return { ok: true };
}

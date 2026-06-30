import { redirect } from "next/navigation";

import { AppearanceForm } from "./appearance-form";

import { auth } from "@/auth";
import { parseButtonFill, parseButtonShape } from "@/lib/button-style";
import { db } from "@/lib/db";
import { parseFont } from "@/lib/fonts";
import { DEFAULT_CUSTOM_PALETTE, DEFAULT_THEME, isThemeId, parseCustomPalette } from "@/lib/themes";

export default async function AppearancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { theme: true, customTheme: true, buttonShape: true, buttonFill: true, font: true },
  });
  if (!user) redirect("/login");

  const current = isThemeId(user.theme) ? user.theme : DEFAULT_THEME;
  const customPalette = parseCustomPalette(user.customTheme) ?? DEFAULT_CUSTOM_PALETTE;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Appearance</h1>
        <p className="text-sm text-muted-foreground">
          Pick a color theme and button style for your public page.
        </p>
      </div>

      <AppearanceForm
        current={current}
        customPalette={customPalette}
        buttonShape={parseButtonShape(user.buttonShape)}
        buttonFill={parseButtonFill(user.buttonFill)}
        font={parseFont(user.font)}
      />
    </div>
  );
}

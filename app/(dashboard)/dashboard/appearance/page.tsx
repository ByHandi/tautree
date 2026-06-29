import { redirect } from "next/navigation";

import { AppearanceForm } from "./appearance-form";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { DEFAULT_THEME, isThemeId } from "@/lib/themes";

export default async function AppearancePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { theme: true },
  });
  if (!user) redirect("/login");

  const current = isThemeId(user.theme) ? user.theme : DEFAULT_THEME;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Tampilan</h1>
        <p className="text-sm text-muted-foreground">
          Pilih tema warna untuk halaman publik kamu.
        </p>
      </div>

      <AppearanceForm current={current} />
    </div>
  );
}

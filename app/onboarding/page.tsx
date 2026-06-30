import { redirect } from "next/navigation";

import type { Metadata } from "next";

import { OnboardingForm } from "./onboarding-form";

import { auth } from "@/auth";
import { Logo } from "@/components/logo";
import { db } from "@/lib/db";
import { USERNAME_MAX } from "@/lib/username";

export const metadata: Metadata = {
  title: "Choose username — Tautree",
};

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, email: true, name: true },
  });
  if (!user) redirect("/login");
  if (user.username) redirect("/dashboard");

  const base = (user.name ?? user.email?.split("@")[0] ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, USERNAME_MAX);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-1 text-center">
          <span className="mx-auto mb-2 flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Logo className="size-5" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">Choose your username</h1>
          <p className="text-sm text-muted-foreground">
            This becomes your public page address. You can change it later.
          </p>
        </div>
        <OnboardingForm suggestion={base} />
      </div>
    </main>
  );
}

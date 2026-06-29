import Link from "next/link";
import { redirect } from "next/navigation";

import { SettingsForm } from "./settings-form";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, name: true, bio: true, avatarUrl: true },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>
        <p className="text-sm text-muted-foreground">
          Atur tampilan profil publik kamu di{" "}
          {user.username ? (
            <Link
              href={`/${user.username}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline underline-offset-4"
            >
              tautree.com/{user.username}
            </Link>
          ) : (
            "halaman publik kamu"
          )}
          .
        </p>
      </div>

      <SettingsForm
        username={user.username}
        name={user.name}
        bio={user.bio}
        avatarUrl={user.avatarUrl}
      />
    </div>
  );
}

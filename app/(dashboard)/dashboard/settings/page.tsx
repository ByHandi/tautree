import Link from "next/link";
import { redirect } from "next/navigation";

import { ContactCardForm } from "./contact-card-form";
import { SettingsForm } from "./settings-form";
import { SocialLinksManager } from "./social-links-manager";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { APP_DOMAIN } from "@/lib/site";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      name: true,
      bio: true,
      avatarUrl: true,
      contactEnabled: true,
      contactPhone: true,
      contactEmail: true,
      contactOrg: true,
      contactTitle: true,
      socials: { orderBy: { order: "asc" }, select: { id: true, url: true } },
    },
  });
  if (!user) redirect("/login");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Set up how your public profile looks at{" "}
          {user.username ? (
            <Link
              href={`/${user.username}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline underline-offset-4"
            >
              {APP_DOMAIN}/{user.username}
            </Link>
          ) : (
            "your public page"
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

      <SocialLinksManager socials={user.socials} />

      <ContactCardForm
        contactEnabled={user.contactEnabled}
        contactPhone={user.contactPhone}
        contactEmail={user.contactEmail}
        contactOrg={user.contactOrg}
        contactTitle={user.contactTitle}
      />
    </div>
  );
}

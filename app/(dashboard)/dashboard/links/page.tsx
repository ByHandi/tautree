import { redirect } from "next/navigation";

import { LinksManager } from "./links-manager";

import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function LinksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const rows = await db.link.findMany({
    where: { userId: session.user.id },
    orderBy: { order: "asc" },
    select: {
      id: true,
      type: true,
      title: true,
      url: true,
      thumbnail: true,
      featured: true,
      isActive: true,
      clicks: true,
      startsAt: true,
      endsAt: true,
    },
  });

  // Serialize the schedule timestamps to ISO strings for the client component.
  const links = rows.map((link) => ({
    ...link,
    startsAt: link.startsAt?.toISOString() ?? null,
    endsAt: link.endsAt?.toISOString() ?? null,
  }));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Links</h1>
        <p className="text-sm text-muted-foreground">
          Manage the links shown on your public page. Drag to reorder, toggle them on/off, or edit
          them anytime.
        </p>
      </div>

      <LinksManager links={links} />
    </div>
  );
}

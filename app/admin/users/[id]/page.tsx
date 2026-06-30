import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminUserLinks } from "./admin-user-links";

import Icon from "@/components/ui/icon";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      bio: true,
      role: true,
      suspended: true,
      createdAt: true,
      links: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, url: true, isActive: true, clicks: true },
      },
    },
  });
  if (!user) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <Link
        href="/admin"
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon name="arrow-left" className="size-4" />
        All users
      </Link>

      <div className="flex flex-col gap-3 rounded-xl border p-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold tracking-tight">
            {user.username ? `@${user.username}` : "No username"}
          </h1>
          {user.role === "ADMIN" && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
              Admin
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              user.suspended
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            )}
          >
            {user.suspended ? "Suspended" : "Active"}
          </span>
          {user.username && !user.suspended && (
            <Link
              href={`/${user.username}`}
              target="_blank"
              rel="noreferrer"
              className="ml-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Icon name="external-link" className="size-4" />
              View public page
            </Link>
          )}
        </div>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{user.name ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="truncate">{user.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Joined</dt>
            <dd>{user.createdAt.toISOString().slice(0, 10)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Bio</dt>
            <dd className="truncate">{user.bio ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Links ({user.links.length})</h2>
        <AdminUserLinks links={user.links} />
      </div>
    </div>
  );
}

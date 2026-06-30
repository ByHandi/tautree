import { AdminUsersTable } from "./admin-users-table";

import { auth } from "@/auth";
import { db } from "@/lib/db";

type SearchParams = Promise<{ q?: string }>;

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await auth();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const where = query
    ? {
        OR: [
          { username: { contains: query, mode: "insensitive" as const } },
          { email: { contains: query, mode: "insensitive" as const } },
          { name: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      role: true,
      suspended: true,
      createdAt: true,
      _count: { select: { links: true } },
      links: { select: { clicks: true } },
    },
  });

  const rows = users.map((u) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    name: u.name,
    role: u.role,
    suspended: u.suspended,
    createdAt: u.createdAt.toISOString(),
    linkCount: u._count.links,
    clicks: u.links.reduce((sum, l) => sum + l.clicks, 0),
    isSelf: u.id === session?.user?.id,
  }));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          Moderate accounts — suspend public pages or remove abusive users.
        </p>
      </div>

      <AdminUsersTable rows={rows} query={query} />
    </div>
  );
}

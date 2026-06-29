import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { db } from "@/lib/db";
import { APP_DOMAIN } from "@/lib/site";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user, totalLinks, activeLinks, sum] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      select: { username: true, name: true },
    }),
    db.link.count({ where: { userId: session.user.id } }),
    db.link.count({ where: { userId: session.user.id, isActive: true } }),
    db.link.aggregate({ where: { userId: session.user.id }, _sum: { clicks: true } }),
  ]);

  const totalClicks = sum._sum.clicks ?? 0;
  const publicHref = user?.username ? `/${user.username}` : "/";

  const stats = [
    { label: "Total link", value: totalLinks, icon: "link" as const },
    { label: "Link aktif", value: activeLinks, icon: "eye" as const },
    { label: "Total klik", value: totalClicks, icon: "mouse-pointer-click" as const },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          Halo{user?.name ? `, ${user.name}` : ""} 👋
        </h1>
        <p className="text-sm text-muted-foreground">
          Halaman publik kamu:{" "}
          <Link
            href={publicHref}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline underline-offset-4"
          >
            {APP_DOMAIN}/{user?.username}
          </Link>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col gap-2 rounded-lg border bg-card p-4">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon name={stat.icon} className="size-4" />
              {stat.label}
            </span>
            <span className="text-3xl font-semibold tracking-tight">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-dashed p-6">
        <div className="flex flex-col gap-1">
          <p className="font-medium">Kelola link kamu</p>
          <p className="text-sm text-muted-foreground">
            Tambah, urutkan, dan atur link yang tampil di halaman publik.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/links" className={cn(buttonVariants())}>
            <Icon name="link" />
            Kelola link
          </Link>
          <Link
            href={publicHref}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <Icon name="external-link" />
            Lihat halaman publik
          </Link>
        </div>
      </div>
    </div>
  );
}

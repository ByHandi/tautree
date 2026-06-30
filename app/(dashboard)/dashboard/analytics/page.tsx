import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Icon from "@/components/ui/icon";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

const WINDOW_DAYS = 30;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (WINDOW_DAYS - 1));

  const [links, daily] = await Promise.all([
    db.link.findMany({
      where: { userId },
      orderBy: { clicks: "desc" },
      select: { id: true, title: true, clicks: true, isActive: true },
    }),
    db.$queryRaw<{ day: Date; count: number }[]>`
      SELECT date_trunc('day', ce.created_at) AS day, count(*)::int AS count
      FROM click_events ce
      JOIN links l ON l.id = ce.link_id
      WHERE l.user_id = ${userId} AND ce.created_at >= ${since}
      GROUP BY day
      ORDER BY day
    `,
  ]);

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const windowClicks = daily.reduce((sum, r) => sum + r.count, 0);

  // Build a continuous 30-day series, filling gaps with 0.
  const counts = new Map(daily.map((r) => [dayKey(new Date(r.day)), r.count]));
  const series = Array.from({ length: WINDOW_DAYS }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    return { date: d, count: counts.get(dayKey(d)) ?? 0 };
  });
  const maxCount = Math.max(1, ...series.map((s) => s.count));
  const maxLinkClicks = Math.max(1, ...links.map((l) => l.clicks));

  const stats = [
    { label: "Total clicks", value: totalClicks, icon: "mouse-pointer-click" as const },
    { label: "Clicks (30 days)", value: windowClicks, icon: "trending-up" as const },
    { label: "Total links", value: links.length, icon: "link" as const },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          See how your links have performed over the last 30 days.
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

      <section className="flex flex-col gap-4 rounded-lg border bg-card p-5">
        <h2 className="text-sm font-medium">Clicks per day</h2>
        {windowClicks === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No clicks in the last 30 days yet.
          </p>
        ) : (
          <div className="flex h-40 items-end gap-1">
            {series.map((s) => (
              <div
                key={s.date.toISOString()}
                className="group flex flex-1 flex-col items-center justify-end"
                title={`${s.date.toLocaleDateString("en-US", { day: "numeric", month: "short" })}: ${s.count} clicks`}
              >
                <div
                  className="w-full rounded-sm bg-primary/80 transition-colors group-hover:bg-primary"
                  style={{
                    height: `${(s.count / maxCount) * 100}%`,
                    minHeight: s.count > 0 ? 2 : 0,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-lg border bg-card p-5">
        <h2 className="text-sm font-medium">Clicks per link</h2>
        {links.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">No links yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {links.map((link) => (
              <li key={link.id} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className={cn("truncate", !link.isActive && "text-muted-foreground")}>
                    {link.title}
                    {!link.isActive && " (inactive)"}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">{link.clicks}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${(link.clicks / maxLinkClicks) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

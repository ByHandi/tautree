import { format } from "date-fns";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AnalyticsRangePicker } from "@/components/analytics-range-picker";
import { buttonVariants } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { dayKey, resolveRange } from "@/lib/analytics";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const { from, to } = await searchParams;
  const { since, until, days } = resolveRange(from, to);

  const viewWhere = { userId, createdAt: { gte: since, lte: until } };
  const [links, daily, totalViews, deviceRows, referrerRows] = await Promise.all([
    db.link.findMany({
      where: { userId },
      orderBy: { clicks: "desc" },
      select: { id: true, title: true, clicks: true, isActive: true },
    }),
    db.$queryRaw<{ day: Date; count: number }[]>`
      SELECT date_trunc('day', ce.created_at) AS day, count(*)::int AS count
      FROM click_events ce
      JOIN links l ON l.id = ce.link_id
      WHERE l.user_id = ${userId} AND ce.created_at >= ${since} AND ce.created_at <= ${until}
      GROUP BY day
      ORDER BY day
    `,
    db.profileView.count({ where: viewWhere }),
    db.profileView.groupBy({ by: ["device"], where: viewWhere, _count: { _all: true } }),
    db.profileView.groupBy({ by: ["referrer"], where: viewWhere, _count: { _all: true } }),
  ]);

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
  const windowClicks = daily.reduce((sum, r) => sum + r.count, 0);

  // Build a continuous day-by-day series across the window, filling gaps with 0.
  const counts = new Map(daily.map((r) => [dayKey(new Date(r.day)), r.count]));
  const series = Array.from({ length: days }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    return { date: d, count: counts.get(dayKey(d)) ?? 0 };
  });
  const maxCount = Math.max(1, ...series.map((s) => s.count));
  const maxLinkClicks = Math.max(1, ...links.map((l) => l.clicks));

  // Device split — always show all three buckets, ordered consistently.
  const deviceCount = (d: string) =>
    deviceRows.find((r) => r.device === d)?._count._all ?? 0;
  const devices = (
    [
      { key: "mobile", label: "Mobile", icon: "smartphone" as const },
      { key: "desktop", label: "Desktop", icon: "monitor" as const },
      { key: "tablet", label: "Tablet", icon: "tablet" as const },
    ] as const
  ).map((d) => ({ ...d, count: deviceCount(d.key) }));

  // Top traffic sources (null referrer = direct), busiest first.
  const sources = referrerRows
    .map((r) => ({ label: r.referrer ?? "Direct", count: r._count._all }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  const maxSource = Math.max(1, ...sources.map((s) => s.count));

  const stats = [
    { label: "Views (period)", value: totalViews, icon: "eye" as const },
    { label: "Clicks (period)", value: windowClicks, icon: "trending-up" as const },
    { label: "Total clicks", value: totalClicks, icon: "mouse-pointer-click" as const },
    { label: "Total links", value: links.length, icon: "link" as const },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            {format(since, "MMM d, yyyy")} – {format(until, "MMM d, yyyy")} · {days} days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AnalyticsRangePicker
            from={format(since, "yyyy-MM-dd")}
            to={format(until, "yyyy-MM-dd")}
          />
          <a
            href={`/dashboard/analytics/export?from=${format(since, "yyyy-MM-dd")}&to=${format(until, "yyyy-MM-dd")}`}
            className={cn(buttonVariants({ variant: "outline", size: "icon" }))}
            aria-label="Export CSV"
            title="Export CSV"
          >
            <Icon name="download" />
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            No clicks in this period yet.
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

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-lg border bg-card p-5">
          <h2 className="text-sm font-medium">Top sources</h2>
          {sources.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No views yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {sources.map((s) => (
                <li key={s.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate">{s.label}</span>
                    <span className="shrink-0 font-medium tabular-nums">{s.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(s.count / maxSource) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-lg border bg-card p-5">
          <h2 className="text-sm font-medium">Devices</h2>
          {totalViews === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No views yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {devices.map((d) => (
                <li key={d.key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2">
                      <Icon name={d.icon} className="size-4 text-muted-foreground" />
                      {d.label}
                    </span>
                    <span className="shrink-0 font-medium tabular-nums">
                      {Math.round((d.count / totalViews) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(d.count / totalViews) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

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

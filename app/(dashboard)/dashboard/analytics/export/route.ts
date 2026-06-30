import { type NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import { dayKey, resolveRange, toCsv } from "@/lib/analytics";
import { db } from "@/lib/db";

type DayCount = { day: Date; count: number };

/**
 * Download the per-day views + clicks for the selected window as CSV. Honors the
 * same `?from&to` params (and `resolveRange` clamping) as the analytics page.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  const sp = req.nextUrl.searchParams;
  const { since, until, days } = resolveRange(
    sp.get("from") ?? undefined,
    sp.get("to") ?? undefined,
  );

  const [clickRows, viewRows] = await Promise.all([
    db.$queryRaw<DayCount[]>`
      SELECT date_trunc('day', ce.created_at) AS day, count(*)::int AS count
      FROM click_events ce
      JOIN links l ON l.id = ce.link_id
      WHERE l.user_id = ${userId} AND ce.created_at >= ${since} AND ce.created_at <= ${until}
      GROUP BY day
    `,
    db.$queryRaw<DayCount[]>`
      SELECT date_trunc('day', created_at) AS day, count(*)::int AS count
      FROM profile_views
      WHERE user_id = ${userId} AND created_at >= ${since} AND created_at <= ${until}
      GROUP BY day
    `,
  ]);

  const clicks = new Map(clickRows.map((r) => [dayKey(new Date(r.day)), r.count]));
  const views = new Map(viewRows.map((r) => [dayKey(new Date(r.day)), r.count]));

  const rows: (string | number)[][] = [["date", "views", "clicks"]];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = dayKey(d);
    rows.push([key, views.get(key) ?? 0, clicks.get(key) ?? 0]);
  }

  const filename = `tautree-analytics_${dayKey(since)}_${dayKey(until)}.csv`;
  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

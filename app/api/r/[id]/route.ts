import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Click-tracking redirect. Public link buttons point here (`/api/r/<id>`); we
 * bump the click counter then 307 to the destination. Inactive/missing links
 * fall back to the home page rather than erroring.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const link = await db.link.findUnique({
    where: { id },
    select: { url: true, isActive: true, user: { select: { suspended: true } } },
  });

  // Skip missing/inactive links, and links owned by a suspended account — a
  // suspended user's links must go dark everywhere, not just on their (404'd)
  // public page.
  if (!link || !link.isActive || link.user.suspended) {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  // Throttle counting per (IP, link) so rapid repeat hits don't inflate stats.
  // The redirect itself is never blocked — we just skip the write when over.
  const allow = rateLimit(`click:${clientIp(_req)}:${id}`, { limit: 5, windowMs: 60_000 });
  if (allow.success) {
    // Best-effort: never block the redirect on a failed write. Bump the
    // denormalized counter and log a click event for time-series analytics.
    try {
      await db.$transaction([
        db.link.update({ where: { id }, data: { clicks: { increment: 1 } } }),
        db.click.create({ data: { linkId: id } }),
      ]);
    } catch {
      // ignore — the user still gets sent to their destination.
    }
  }

  return NextResponse.redirect(link.url);
}

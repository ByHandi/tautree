import { type NextRequest, NextResponse } from "next/server";

import { classifyDevice, isBot, referrerLabel } from "@/lib/analytics";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { APP_DOMAIN } from "@/lib/site";

/**
 * Profile view tracker. The public page's <ViewTracker> beacons here with the
 * visitor's `document.referrer`; we log a coarse device + referrer host. Always
 * returns 204 — the client ignores the response and we never block on it.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const noContent = new NextResponse(null, { status: 204 });

  const ua = req.headers.get("user-agent");
  if (isBot(ua)) return noContent;

  // Dedup rapid reloads from the same viewer so refreshes don't inflate views.
  const allow = rateLimit(`view:${clientIp(req)}:${id}`, { limit: 1, windowMs: 30_000 });
  if (!allow.success) return noContent;

  let referrer: string | null = null;
  try {
    const body = await req.json();
    const raw = typeof body?.referrer === "string" ? body.referrer : null;
    referrer = referrerLabel(raw, APP_DOMAIN);
  } catch {
    // Malformed body → treat as direct.
  }

  try {
    // Unknown/invalid ids fail the FK and are swallowed — the tracker only
    // mounts on valid, public profile pages anyway.
    await db.profileView.create({ data: { userId: id, device: classifyDevice(ua), referrer } });
  } catch {
    // ignore
  }

  return noContent;
}

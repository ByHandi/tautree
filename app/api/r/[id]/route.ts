import { NextResponse, type NextRequest } from "next/server";

import { db } from "@/lib/db";

/**
 * Click-tracking redirect. Public link buttons point here (`/api/r/<id>`); we
 * bump the click counter then 307 to the destination. Inactive/missing links
 * fall back to the home page rather than erroring.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const link = await db.link.findUnique({
    where: { id },
    select: { url: true, isActive: true },
  });

  if (!link || !link.isActive) {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  // Best-effort: never block the redirect on a failed counter write.
  try {
    await db.link.update({ where: { id }, data: { clicks: { increment: 1 } } });
  } catch {
    // ignore — the user still gets sent to their destination.
  }

  return NextResponse.redirect(link.url);
}

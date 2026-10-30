import { type NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isProfilePublic } from "@/lib/profile";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { APP_URL } from "@/lib/site";
import { normalizeUsername, validateUsername } from "@/lib/username";
import { buildVCard } from "@/lib/vcard";

/**
 * "Save contact" download (`.vcf`) for a public profile. The contact details
 * live only here, never in the profile page HTML. Unknown, suspended, and
 * opted-out profiles all get the same 404 so the response doesn't reveal which.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  // Throttle per visitor to slow down scraping of contact details.
  if (!rateLimit(`vcard:${clientIp(req)}`, { limit: 30, windowMs: 60_000 }).success) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  const { username: raw } = await params;
  const username = normalizeUsername(decodeURIComponent(raw));
  if (!validateUsername(username).ok) return notFound();

  const user = await db.user.findUnique({
    where: { username },
    select: {
      name: true,
      bio: true,
      suspended: true,
      contactEnabled: true,
      contactPhone: true,
      contactEmail: true,
      contactOrg: true,
      contactTitle: true,
    },
  });
  if (!user || !isProfilePublic(user) || !user.contactEnabled) return notFound();

  const vcard = buildVCard({
    name: user.name ?? `@${username}`,
    url: `${APP_URL}/${username}`,
    note: user.bio,
    phone: user.contactPhone,
    email: user.contactEmail,
    org: user.contactOrg,
    title: user.contactTitle,
  });

  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      // Safe to inline: validateUsername allows only [a-z0-9_].
      "Content-Disposition": `attachment; filename="${username}.vcf"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

function notFound() {
  return new NextResponse("Not found", { status: 404 });
}

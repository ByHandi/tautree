import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { normalizeUsername, validateUsername } from "@/lib/username";

/** GET /api/username/check?u=foo -> { available, reason? } */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ available: false, reason: "Unauthorized" }, { status: 401 });
  }

  const raw = new URL(req.url).searchParams.get("u") ?? "";
  const username = normalizeUsername(raw);

  const valid = validateUsername(username);
  if (!valid.ok) {
    return NextResponse.json({ available: false, reason: valid.reason });
  }

  const existing = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });

  // The user's own (future) username is fine; anyone else's is taken.
  const available = !existing || existing.id === session.user.id;
  return NextResponse.json({
    available,
    reason: available ? undefined : "Username sudah dipakai.",
  });
}

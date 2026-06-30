import type { MetadataRoute } from "next";

import { db } from "@/lib/db";
import { APP_URL } from "@/lib/site";

// Generated on demand, not at build time — it queries the DB, which isn't
// available during `next build` (CI / Docker builder run without a database).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const users = await db.user.findMany({
    where: { suspended: false, username: { not: null } },
    select: { username: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
    take: 10_000,
  });

  const profiles: MetadataRoute.Sitemap = users.map((u) => ({
    url: `${APP_URL}/${u.username}`,
    lastModified: u.updatedAt,
  }));

  return [{ url: APP_URL, lastModified: new Date() }, ...profiles];
}

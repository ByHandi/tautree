import type { MetadataRoute } from "next";

import { APP_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private/app surfaces — no value being crawled.
      disallow: ["/dashboard", "/admin", "/api", "/onboarding", "/login"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}

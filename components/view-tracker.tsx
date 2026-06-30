"use client";

import { useEffect } from "react";

/**
 * Fire-and-forget profile view ping. Runs once on mount and reports the real
 * traffic source via `document.referrer` (the request's Referer header would
 * only ever be the profile page itself). Device is classified server-side from
 * the User-Agent. No-JS bots never reach this, which keeps counts honest.
 */
export function ViewTracker({ userId }: { userId: string }) {
  useEffect(() => {
    const url = `/api/v/${userId}`;
    const body = JSON.stringify({ referrer: document.referrer });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
      } else {
        void fetch(url, {
          method: "POST",
          body,
          headers: { "Content-Type": "application/json" },
          keepalive: true,
        });
      }
    } catch {
      // Analytics is best-effort — never disrupt the page.
    }
  }, [userId]);

  return null;
}

/**
 * Pure helpers for privacy-friendly profile-view analytics. No fingerprinting:
 * a User-Agent is reduced to a coarse form factor, and a referrer URL to its
 * registrable host. Decoupled from the request/DB layer so they're testable.
 */

export type Device = "mobile" | "tablet" | "desktop";

/** Coarse device class from a User-Agent string. Defaults to "desktop". */
export function classifyDevice(ua: string | null | undefined): Device {
  const s = (ua ?? "").toLowerCase();
  // Tablets first — many tablet UAs also contain "android"/"mobile" tokens.
  if (/ipad|tablet|playbook|silk|kindle|(?:android(?!.*mobi))/.test(s)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|iemobile|opera mini|windows phone/.test(s)) {
    return "mobile";
  }
  return "desktop";
}

/** True for obvious bots/crawlers/link-preview fetchers we don't want to count. */
export function isBot(ua: string | null | undefined): boolean {
  return /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|preview|headless|lighthouse|pingdom|uptime/i.test(
    ua ?? "",
  );
}

/**
 * Reduce a raw referrer URL to a host label, or null for direct/self traffic.
 * Our own domain (`selfHost`) counts as direct so internal navigation doesn't
 * pollute the traffic-source breakdown.
 */
export function referrerLabel(
  raw: string | null | undefined,
  selfHost: string,
): string | null {
  if (!raw) return null;
  let host: string;
  try {
    host = new URL(raw).hostname.toLowerCase();
  } catch {
    return null;
  }
  host = host.replace(/^www\./, "");
  const self = selfHost.toLowerCase().replace(/^www\./, "");
  if (!host || host === self || host.endsWith(`.${self}`)) return null;
  return host;
}

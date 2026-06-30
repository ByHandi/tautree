/**
 * Pure helpers for privacy-friendly profile-view analytics. No fingerprinting:
 * a User-Agent is reduced to a coarse form factor, and a referrer URL to its
 * registrable host. Decoupled from the request/DB layer so they're testable.
 */

export const ANALYTICS_DEFAULT_DAYS = 30;
/** Hard cap on the window so a hand-edited URL can't request an unbounded scan. */
export const ANALYTICS_MAX_DAYS = 366;

const DAY_MS = 86_400_000;

/** Parse a `YYYY-MM-DD` string to a local-midnight Date, or null if invalid. */
function parseDay(value: string | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export type DateWindow = { since: Date; until: Date; days: number };

/**
 * Resolve the analytics window from `from`/`to` query strings. Falls back to the
 * last {@link ANALYTICS_DEFAULT_DAYS} days when either is missing/invalid or the
 * order is reversed, and clamps the span to {@link ANALYTICS_MAX_DAYS}. Returns
 * inclusive day boundaries (start-of-`since`, end-of-`until`) plus the day count.
 */
export function resolveRange(
  fromStr: string | undefined,
  toStr: string | undefined,
  now: Date = new Date(),
): DateWindow {
  const fromDay = parseDay(fromStr);
  const toDay = parseDay(toStr);

  let since: Date;
  let until: Date;
  if (fromDay && toDay && fromDay <= toDay) {
    since = fromDay;
    until = toDay;
  } else {
    until = new Date(now);
    since = new Date(now);
    since.setDate(since.getDate() - (ANALYTICS_DEFAULT_DAYS - 1));
  }

  // Normalize to day boundaries.
  since.setHours(0, 0, 0, 0);
  until.setHours(0, 0, 0, 0);

  // Clamp an over-long span by pulling `since` forward.
  const maxSpanMs = (ANALYTICS_MAX_DAYS - 1) * DAY_MS;
  if (until.getTime() - since.getTime() > maxSpanMs) {
    since = new Date(until.getTime() - maxSpanMs);
    since.setHours(0, 0, 0, 0);
  }

  const days = Math.round((until.getTime() - since.getTime()) / DAY_MS) + 1;
  const untilEnd = new Date(until);
  untilEnd.setHours(23, 59, 59, 999);
  return { since, until: untilEnd, days };
}

/** Stable day bucket key (UTC `YYYY-MM-DD`) — shared by the chart and exports. */
export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Serialize rows to RFC-4180 CSV. Fields containing a comma, quote, or newline
 * are double-quoted with internal quotes doubled. Rows are CRLF-separated.
 */
export function toCsv(rows: (string | number)[][]): string {
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((row) => row.map(escape).join(",")).join("\r\n");
}

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
export function referrerLabel(raw: string | null | undefined, selfHost: string): string | null {
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

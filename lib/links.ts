/** Shared link rules used by the dashboard create/edit actions. */

export const TITLE_MAX = 80;

/**
 * A link is publicly live only when it's active, inside its scheduling window,
 * AND its owner isn't suspended. Single source of truth for the public page and
 * the click-redirect — a suspended account's links must go dark everywhere.
 *
 * Scheduling window is inclusive of `startsAt` and exclusive of `endsAt`; a null
 * bound means "no bound". The public-page query mirrors this with
 * `liveScheduleWhere` — keep the two in sync.
 */
export function isLinkLive(
  link: { isActive: boolean; startsAt?: Date | null; endsAt?: Date | null },
  owner: { suspended: boolean },
  now: Date = new Date(),
): boolean {
  if (!link.isActive || owner.suspended) return false;
  if (link.startsAt && now < link.startsAt) return false;
  if (link.endsAt && now >= link.endsAt) return false;
  return true;
}

/**
 * Prisma `where` fragment selecting links inside their scheduling window at
 * `now`. Mirrors the schedule half of `isLinkLive` for use in DB queries (the
 * caller adds the `isActive`/owner checks). Keep in sync with `isLinkLive`.
 */
export function liveScheduleWhere(now: Date) {
  return {
    AND: [
      { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
      { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
    ],
  };
}

export type TitleCheck = { ok: true } | { ok: false; reason: string };
export type UrlCheck = { ok: true; url: string } | { ok: false; reason: string };

/** Validate a link title (raw user input). */
export function validateTitle(raw: string): TitleCheck {
  const title = raw.trim();
  if (title.length === 0) return { ok: false, reason: "Title is required." };
  if (title.length > TITLE_MAX) {
    return { ok: false, reason: `Must be at most ${TITLE_MAX} characters.` };
  }
  return { ok: true };
}

/**
 * Normalize and validate a URL. Adds an `https://` prefix when the scheme is
 * missing and rejects anything that isn't an http(s) URL (e.g. javascript:).
 */
export function normalizeUrl(raw: string): UrlCheck {
  let value = raw.trim();
  if (value.length === 0) return { ok: false, reason: "URL is required." };
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, reason: "Invalid URL." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "Only http/https URLs are supported." };
  }
  if (!parsed.hostname.includes(".")) {
    return { ok: false, reason: "Invalid URL." };
  }

  return { ok: true, url: parsed.toString() };
}

export type ScheduleCheck =
  | { ok: true; startsAt: Date | null; endsAt: Date | null }
  | { ok: false; reason: string };

/**
 * Parse the optional start/end timestamps from the link form. Empty strings
 * mean "no bound" (→ null). The client submits ISO-8601 strings (with offset),
 * so interpretation is timezone-correct regardless of server locale. Rejects
 * unparseable values and windows that end at or before they start.
 */
export function parseSchedule(rawStart: string, rawEnd: string): ScheduleCheck {
  const startsAt = parseDateInput(rawStart);
  const endsAt = parseDateInput(rawEnd);
  if (startsAt === "invalid" || endsAt === "invalid") {
    return { ok: false, reason: "Invalid date." };
  }
  if (startsAt && endsAt && endsAt <= startsAt) {
    return { ok: false, reason: "End date must be after the start date." };
  }
  return { ok: true, startsAt, endsAt };
}

function parseDateInput(raw: string): Date | null | "invalid" {
  const value = raw.trim();
  if (value.length === 0) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "invalid" : date;
}

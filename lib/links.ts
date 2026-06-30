/** Shared link rules used by the dashboard create/edit actions. */

export const TITLE_MAX = 80;

/**
 * A link is publicly live only when it's active AND its owner isn't suspended.
 * Single source of truth for the public page and the click-redirect — a
 * suspended account's links must go dark everywhere.
 */
export function isLinkLive(
  link: { isActive: boolean },
  owner: { suspended: boolean },
): boolean {
  return link.isActive && !owner.suspended;
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

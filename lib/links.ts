/** Shared link rules used by the dashboard create/edit actions. */

export const TITLE_MAX = 80;

export type TitleCheck = { ok: true } | { ok: false; reason: string };
export type UrlCheck = { ok: true; url: string } | { ok: false; reason: string };

/** Validate a link title (raw user input). */
export function validateTitle(raw: string): TitleCheck {
  const title = raw.trim();
  if (title.length === 0) return { ok: false, reason: "Judul wajib diisi." };
  if (title.length > TITLE_MAX) {
    return { ok: false, reason: `Maksimal ${TITLE_MAX} karakter.` };
  }
  return { ok: true };
}

/**
 * Normalize and validate a URL. Adds an `https://` prefix when the scheme is
 * missing and rejects anything that isn't an http(s) URL (e.g. javascript:).
 */
export function normalizeUrl(raw: string): UrlCheck {
  let value = raw.trim();
  if (value.length === 0) return { ok: false, reason: "URL wajib diisi." };
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, reason: "URL tidak valid." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "Hanya URL http/https yang didukung." };
  }
  if (!parsed.hostname.includes(".")) {
    return { ok: false, reason: "URL tidak valid." };
  }

  return { ok: true, url: parsed.toString() };
}

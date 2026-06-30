/** Shared profile rules used by the dashboard settings action. */

export const NAME_MAX = 50;
export const BIO_MAX = 160;

/**
 * A profile is publicly visible only when the account isn't suspended. Used by
 * the public page, the OG image, and the sitemap so moderation is consistent.
 */
export function isProfilePublic(user: { suspended: boolean }): boolean {
  return !user.suspended;
}

export type NameCheck = { ok: true; name: string | null } | { ok: false; reason: string };
export type BioCheck = { ok: true; bio: string | null } | { ok: false; reason: string };
export type AvatarCheck = { ok: true; url: string | null } | { ok: false; reason: string };

/** Validate a display name. Empty is allowed (falls back to @username). */
export function validateName(raw: string): NameCheck {
  const name = raw.trim();
  if (name.length === 0) return { ok: true, name: null };
  if (name.length > NAME_MAX) {
    return { ok: false, reason: `Must be at most ${NAME_MAX} characters.` };
  }
  return { ok: true, name };
}

/** Validate a bio. Empty is allowed. */
export function validateBio(raw: string): BioCheck {
  const bio = raw.trim();
  if (bio.length === 0) return { ok: true, bio: null };
  if (bio.length > BIO_MAX) {
    return { ok: false, reason: `Must be at most ${BIO_MAX} characters.` };
  }
  return { ok: true, bio };
}

/**
 * Validate an avatar URL. Empty clears the avatar (returns null). Adds an
 * `https://` prefix when missing and rejects anything that isn't an http(s) URL.
 */
export function validateAvatarUrl(raw: string): AvatarCheck {
  let value = raw.trim();
  if (value.length === 0) return { ok: true, url: null };
  if (!/^https?:\/\//i.test(value)) value = `https://${value}`;

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { ok: false, reason: "Invalid image URL." };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "Only http/https URLs are supported." };
  }
  if (!parsed.hostname.includes(".")) {
    return { ok: false, reason: "Invalid image URL." };
  }

  return { ok: true, url: parsed.toString() };
}

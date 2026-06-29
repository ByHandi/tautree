/** Shared username rules used by both the availability API and the claim action. */

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;

// lowercase letters, digits and underscores; must start with a letter/digit
const USERNAME_RE = /^[a-z0-9][a-z0-9_]*$/;

// Paths that would collide with app routes or are otherwise off-limits.
const RESERVED = new Set([
  "api",
  "login",
  "logout",
  "signin",
  "signout",
  "register",
  "onboarding",
  "dashboard",
  "settings",
  "admin",
  "about",
  "help",
  "support",
  "terms",
  "privacy",
  "tautree",
  "www",
  "app",
  "static",
  "public",
  "_next",
  "favicon",
]);

export type UsernameCheck = { ok: true } | { ok: false; reason: string };

/** Validate a raw username (already expected lowercased/trimmed). */
export function validateUsername(raw: string): UsernameCheck {
  const username = raw.trim().toLowerCase();

  if (username.length < USERNAME_MIN) {
    return { ok: false, reason: `Must be at least ${USERNAME_MIN} characters.` };
  }
  if (username.length > USERNAME_MAX) {
    return { ok: false, reason: `Must be at most ${USERNAME_MAX} characters.` };
  }
  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      reason: "Only lowercase letters, numbers, and underscores (_).",
    };
  }
  if (RESERVED.has(username)) {
    return { ok: false, reason: "This username isn't available." };
  }
  return { ok: true };
}

/** Normalize user input into a candidate username. */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

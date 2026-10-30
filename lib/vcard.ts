/**
 * Contact card (vCard) rules: validation for the dashboard form and the `.vcf`
 * builder served by `/api/vcard/[username]`.
 */

export const CONTACT_PHONE_MAX = 30;
export const CONTACT_EMAIL_MAX = 254;
export const CONTACT_TEXT_MAX = 80;

const PHONE_MIN_DIGITS = 6;
const PHONE_RE = /^[0-9+\-(). ]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// RFC 6350 §3.2: lines longer than 75 octets are folded with CRLF + one space.
const FOLD_OCTETS = 75;
const encoder = new TextEncoder();

export type ContactCheck = { ok: true; value: string | null } | { ok: false; reason: string };

/** Drop C0 control characters (incl. CR/LF) and DEL. */
function stripControlChars(value: string): string {
  return [...value].filter((ch) => ch >= " " && ch !== "\u007f").join("");
}

function hasControlChars(value: string): boolean {
  return stripControlChars(value) !== value;
}

/** Validate a phone number. Empty is allowed (null). */
export function validateContactPhone(raw: string): ContactCheck {
  const phone = raw.trim();
  if (phone.length === 0) return { ok: true, value: null };
  if (phone.length > CONTACT_PHONE_MAX) {
    return { ok: false, reason: `Phone must be at most ${CONTACT_PHONE_MAX} characters.` };
  }
  const digits = phone.replace(/\D/g, "").length;
  if (!PHONE_RE.test(phone) || digits < PHONE_MIN_DIGITS) {
    return { ok: false, reason: "Enter a valid phone number." };
  }
  return { ok: true, value: phone };
}

/** Validate a public contact email (lowercased). Empty is allowed (null). */
export function validateContactEmail(raw: string): ContactCheck {
  const email = raw.trim().toLowerCase();
  if (email.length === 0) return { ok: true, value: null };
  if (email.length > CONTACT_EMAIL_MAX) {
    return { ok: false, reason: `Email must be at most ${CONTACT_EMAIL_MAX} characters.` };
  }
  if (!EMAIL_RE.test(email)) return { ok: false, reason: "Enter a valid email address." };
  return { ok: true, value: email };
}

/** Validate a single-line text field (organization, job title). Empty is allowed (null). */
export function validateContactText(raw: string, label: string): ContactCheck {
  const text = raw.trim();
  if (text.length === 0) return { ok: true, value: null };
  if (text.length > CONTACT_TEXT_MAX) {
    return { ok: false, reason: `${label} must be at most ${CONTACT_TEXT_MAX} characters.` };
  }
  if (hasControlChars(text)) return { ok: false, reason: `${label} can't contain line breaks.` };
  return { ok: true, value: text };
}

/**
 * Escape a vCard TEXT value (RFC 6350 §3.4): backslash, comma and semicolon are
 * backslash-escaped and line breaks become `\n`, so a value can never start a
 * new property line. Other control characters are dropped.
 */
export function escapeText(value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n");
  return stripControlChars(escaped).replace(/[;,]/g, (ch) => `\\${ch}`);
}

/**
 * Fold a content line to at most 75 octets per physical line. Splits between
 * code points only, so multibyte UTF-8 characters (emoji, accents) stay whole.
 */
export function foldLine(line: string): string {
  const parts: string[] = [];
  let current = "";
  let size = 0;
  for (const ch of line) {
    const bytes = encoder.encode(ch).length;
    // Continuation lines start with the folding space, which counts toward the limit.
    const limit = parts.length === 0 ? FOLD_OCTETS : FOLD_OCTETS - 1;
    if (size + bytes > limit) {
      parts.push(current);
      current = "";
      size = 0;
    }
    current += ch;
    size += bytes;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export type ContactCard = {
  /** Display name (the profile name, or `@username`). */
  name: string;
  /** Public profile URL. */
  url: string;
  note?: string | null;
  phone?: string | null;
  email?: string | null;
  org?: string | null;
  title?: string | null;
};

/** Build a vCard 3.0 file (CRLF line endings), leaving out empty fields. */
export function buildVCard(card: ContactCard): string {
  const name = escapeText(card.name);
  const optional: [string, string | null | undefined][] = [
    ["ORG", card.org],
    ["TITLE", card.title],
    ["TEL;TYPE=CELL", card.phone],
    ["EMAIL;TYPE=INTERNET", card.email],
    ["NOTE", card.note],
  ];

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    `N:;${name};;;`,
    ...optional.flatMap(([key, value]) => (value ? [`${key}:${escapeText(value)}`] : [])),
    // A URI value, not TEXT: commas/semicolons must stay unescaped.
    `URL:${stripControlChars(card.url)}`,
    "END:VCARD",
  ];
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}

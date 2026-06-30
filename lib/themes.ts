/**
 * Theme presets for the public profile page. Colors are applied as inline
 * styles (not Tailwind classes) so they survive across the public renderer and
 * the dashboard preview without depending on class generation.
 */

export type PresetThemeId = "default" | "dark" | "sunset" | "ocean" | "forest" | "mono";

/** A preset id, or "custom" when the user supplies their own palette. */
export type ThemeId = PresetThemeId | "custom";

export type Theme = {
  id: ThemeId;
  label: string;
  /** Page background (any CSS background value, incl. gradients). */
  page: string;
  /** Primary text (name). */
  text: string;
  /** Secondary text (bio, footer). */
  muted: string;
  /** Link button background. */
  card: string;
  /** Link button text. */
  cardText: string;
  /** Link button border. */
  cardBorder: string;
};

export const THEMES: Record<PresetThemeId, Theme> = {
  default: {
    id: "default",
    label: "Default",
    page: "#f8fafc",
    text: "#0f172a",
    muted: "#64748b",
    card: "#ffffff",
    cardText: "#0f172a",
    cardBorder: "#e2e8f0",
  },
  dark: {
    id: "dark",
    label: "Dark",
    page: "#0b1120",
    text: "#f8fafc",
    muted: "#94a3b8",
    card: "#1e293b",
    cardText: "#f8fafc",
    cardBorder: "#334155",
  },
  sunset: {
    id: "sunset",
    label: "Sunset",
    page: "linear-gradient(160deg, #ff7e5f 0%, #feb47b 100%)",
    text: "#ffffff",
    muted: "rgba(255,255,255,0.85)",
    card: "rgba(255,255,255,0.18)",
    cardText: "#ffffff",
    cardBorder: "rgba(255,255,255,0.35)",
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    page: "linear-gradient(160deg, #2193b0 0%, #6dd5ed 100%)",
    text: "#ffffff",
    muted: "rgba(255,255,255,0.85)",
    card: "rgba(255,255,255,0.18)",
    cardText: "#ffffff",
    cardBorder: "rgba(255,255,255,0.35)",
  },
  forest: {
    id: "forest",
    label: "Forest",
    page: "linear-gradient(160deg, #134e5e 0%, #71b280 100%)",
    text: "#ffffff",
    muted: "rgba(255,255,255,0.85)",
    card: "rgba(255,255,255,0.16)",
    cardText: "#ffffff",
    cardBorder: "rgba(255,255,255,0.32)",
  },
  mono: {
    id: "mono",
    label: "Mono",
    page: "#000000",
    text: "#ffffff",
    muted: "#a3a3a3",
    card: "#000000",
    cardText: "#ffffff",
    cardBorder: "#ffffff",
  },
};

export const THEME_LIST: Theme[] = Object.values(THEMES);

export const DEFAULT_THEME: PresetThemeId = "default";

export const CUSTOM_THEME_ID = "custom" as const;

/** The editable color fields of a custom palette (no id/label). */
export type CustomPalette = Omit<Theme, "id" | "label">;

/** Order matters: drives the swatch list in the appearance form. */
export const CUSTOM_PALETTE_FIELDS = [
  { key: "page", label: "Background" },
  { key: "text", label: "Name text" },
  { key: "muted", label: "Bio text" },
  { key: "card", label: "Button" },
  { key: "cardText", label: "Button text" },
  { key: "cardBorder", label: "Button border" },
] as const satisfies ReadonlyArray<{ key: keyof CustomPalette; label: string }>;

/** Seed for a fresh custom palette — the Default preset, minus id/label. */
export const DEFAULT_CUSTOM_PALETTE: CustomPalette = {
  page: THEMES.default.page,
  text: THEMES.default.text,
  muted: THEMES.default.muted,
  card: THEMES.default.card,
  cardText: THEMES.default.cardText,
  cardBorder: THEMES.default.cardBorder,
};

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** A single color is valid only if it's a plain hex literal (no url()/expr). */
export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value);
}

/**
 * Validate an untrusted value (from the DB Json column or a form) as a custom
 * palette. Every field must be a hex color — this is the guard that keeps
 * arbitrary CSS out of the inline styles on the public page.
 */
export function parseCustomPalette(value: unknown): CustomPalette | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const out = {} as CustomPalette;
  for (const { key } of CUSTOM_PALETTE_FIELDS) {
    if (!isHexColor(v[key])) return null;
    out[key] = v[key];
  }
  return out;
}

/** Build a Theme from a validated custom palette. */
export function customTheme(palette: CustomPalette): Theme {
  return { id: CUSTOM_THEME_ID, label: "Custom", ...palette };
}

/**
 * Resolve a stored theme to a Theme. When `theme` is "custom" and a valid
 * palette is present, the custom palette wins; otherwise fall back to the
 * matching preset (or Default).
 */
export function getTheme(id: string | null | undefined, custom?: unknown): Theme {
  if (id === CUSTOM_THEME_ID) {
    const palette = parseCustomPalette(custom);
    if (palette) return customTheme(palette);
    return THEMES[DEFAULT_THEME];
  }
  return THEMES[(id ?? "") as PresetThemeId] ?? THEMES[DEFAULT_THEME];
}

/** Type guard for a valid preset theme id. */
export function isPresetThemeId(value: string): value is PresetThemeId {
  return value in THEMES;
}

/** Type guard for any valid theme id (preset or "custom"). */
export function isThemeId(value: string): value is ThemeId {
  return value === CUSTOM_THEME_ID || isPresetThemeId(value);
}

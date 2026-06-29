/**
 * Theme presets for the public profile page. Colors are applied as inline
 * styles (not Tailwind classes) so they survive across the public renderer and
 * the dashboard preview without depending on class generation.
 */

export type ThemeId = "default" | "dark" | "sunset" | "ocean" | "forest" | "mono";

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

export const THEMES: Record<ThemeId, Theme> = {
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

export const DEFAULT_THEME: ThemeId = "default";

/** Resolve a stored theme string to a Theme, falling back to the default. */
export function getTheme(id: string | null | undefined): Theme {
  return THEMES[(id ?? "") as ThemeId] ?? THEMES[DEFAULT_THEME];
}

/** Type guard for a valid theme id. */
export function isThemeId(value: string): value is ThemeId {
  return value in THEMES;
}

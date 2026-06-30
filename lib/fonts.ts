/**
 * Public-page font choice. Resolved to a CSS font-family stack (no extra web
 * fonts loaded): Sans/Mono reuse the app's already-loaded faces via CSS vars,
 * Serif/Rounded fall back to system families. Pure + client-safe so the
 * dashboard preview and the public renderer share one source of truth.
 */

export type FontId = "sans" | "serif" | "mono" | "rounded";

export const DEFAULT_FONT: FontId = "sans";

export const FONT_OPTIONS: { id: FontId; label: string; stack: string }[] = [
  { id: "sans", label: "Sans", stack: "var(--font-sans), ui-sans-serif, system-ui, sans-serif" },
  { id: "serif", label: "Serif", stack: "ui-serif, Georgia, Cambria, 'Times New Roman', serif" },
  {
    id: "mono",
    label: "Mono",
    stack: "var(--font-mono), ui-monospace, 'SFMono-Regular', monospace",
  },
  {
    id: "rounded",
    label: "Rounded",
    stack: "ui-rounded, 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', system-ui, sans-serif",
  },
];

/** Coerce untrusted input to a valid FontId, defaulting to Sans. */
export function parseFont(value: string | null | undefined): FontId {
  return FONT_OPTIONS.some((f) => f.id === value) ? (value as FontId) : DEFAULT_FONT;
}

/** CSS font-family stack for a font id. */
export function fontStack(id: FontId): string {
  return (FONT_OPTIONS.find((f) => f.id === id) ?? FONT_OPTIONS[0]).stack;
}

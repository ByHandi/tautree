/**
 * Public-page link button styling — two orthogonal axes (shape + fill) layered
 * on top of the color theme. Pure resolution to an inline-style object so it
 * works the same in the public renderer and the dashboard preview.
 */
import type { Theme } from "./themes";

export type ButtonShape = "rounded" | "pill" | "square";
export type ButtonFill = "solid" | "outline" | "soft";

export const DEFAULT_BUTTON_SHAPE: ButtonShape = "rounded";
export const DEFAULT_BUTTON_FILL: ButtonFill = "solid";

/** Drives the dashboard selectors; order matters. */
export const BUTTON_SHAPES: { value: ButtonShape; label: string }[] = [
  { value: "rounded", label: "Rounded" },
  { value: "pill", label: "Pill" },
  { value: "square", label: "Square" },
];
export const BUTTON_FILLS: { value: ButtonFill; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "outline", label: "Outline" },
  { value: "soft", label: "Soft" },
];

/** Coerce untrusted input to a valid shape/fill, defaulting to the base style. */
export function parseButtonShape(value: string | null | undefined): ButtonShape {
  return value === "pill" || value === "square" ? value : DEFAULT_BUTTON_SHAPE;
}
export function parseButtonFill(value: string | null | undefined): ButtonFill {
  return value === "outline" || value === "soft" ? value : DEFAULT_BUTTON_FILL;
}

const RADIUS: Record<ButtonShape, string> = {
  rounded: "0.75rem",
  pill: "9999px",
  square: "0.25rem",
};

export type ButtonAppearance = {
  background: string;
  color: string;
  borderColor: string;
  borderWidth: string;
  borderRadius: string;
  /** Whether the button should carry the resting/hover shadow. */
  shadow: boolean;
};

/** Resolve the inline style for a link button from theme + chosen style. */
export function linkButtonAppearance(
  theme: Theme,
  shape: ButtonShape,
  fill: ButtonFill,
): ButtonAppearance {
  const borderRadius = RADIUS[shape];
  switch (fill) {
    case "outline":
      return {
        background: "transparent",
        color: theme.text,
        borderColor: theme.text,
        borderWidth: "1.5px",
        borderRadius,
        shadow: false,
      };
    case "soft":
      return {
        background: theme.card,
        color: theme.cardText,
        borderColor: "transparent",
        borderWidth: "0",
        borderRadius,
        shadow: false,
      };
    case "solid":
    default:
      return {
        background: theme.card,
        color: theme.cardText,
        borderColor: theme.cardBorder,
        borderWidth: "1px",
        borderRadius,
        shadow: true,
      };
  }
}

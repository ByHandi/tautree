# Tautree — brand mark bundle

Vector logo files extracted from the brand-mark artifact. The mark is _one root branching into many leaves_ — one stroke weight, four nodes — built to stay crisp from a 16px favicon up to a hero.

## Files

| File                       | What it is                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| `tautree-logos-all.svg`    | **Contact sheet** — every variant on one canvas. Drop this into Figma to see everything at once. |
| `tautree-mark.svg`         | Core mark, ink (`#0A0F0D`), transparent background. The master.                                  |
| `tautree-mark-emerald.svg` | Mark in emerald — use on light backgrounds.                                                      |
| `tautree-mark-mint.svg`    | Mark in mint — use on dark backgrounds.                                                          |
| `tautree-mark-white.svg`   | Mark in white — knockout for photos / colored fills.                                             |
| `tautree-app-icon.svg`     | Rounded-square app icon: linear mint→emerald gradient, ink mark.                                 |
| `tautree-icon-radial.svg`  | Same tile with the radial "hero" gradient.                                                       |
| `tautree-icon-dark.svg`    | Dark tile (`#0B1411`) with a mint mark.                                                          |
| `tautree-lockup.svg`       | Horizontal lockup: gradient chip + "Tautree" wordmark.                                           |
| `tautree-wordmark.svg`     | "Tautree" wordmark only.                                                                         |

## Palette

| Token         | Hex       |
| ------------- | --------- |
| Mint          | `#34E0A1` |
| Emerald       | `#10B981` |
| Ink           | `#0A0F0D` |
| Paper         | `#F4F8F6` |
| Line          | `#E2EAE6` |
| Moss (labels) | `#5E726B` |
| Dark surface  | `#0B1411` |

Hero gradient stops: `#6CF3BE → #10B981 → #0C9D6E`.

## Geometry

`viewBox 0 0 32 32` · stroke `2.2`, round caps · 4 nodes, radius `2.6` · single color (`currentColor` in the original component).

## Type

Wordmark is set in the system sans stack at weight **650**, letter-spacing **-0.02em**. The SVGs keep it as live `<text>`, so in Figma you can swap to whatever brand face you settle on (e.g. Inter / SF Pro). Labels use a monospace face.

## Using in Figma

1. **File → Place image** (or just drag the `.svg` onto the canvas).
2. The mark imports as editable vector paths; gradients and the rounded tile come in as real fills/shapes; the wordmark comes in as editable text.
3. Start with `tautree-logos-all.svg` to review all variants, then pull in the individual files you need.

> Note: these were generated as files because there's no Figma connection in this session — import them as above and they're fully editable.

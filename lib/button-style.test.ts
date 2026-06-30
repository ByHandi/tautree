import { describe, expect, it } from "vitest";

import {
  DEFAULT_BUTTON_FILL,
  DEFAULT_BUTTON_SHAPE,
  linkButtonAppearance,
  parseButtonFill,
  parseButtonShape,
} from "./button-style";
import type { Theme } from "./themes";

const theme: Theme = {
  id: "default",
  label: "Default",
  page: "#fff",
  text: "#111",
  muted: "#777",
  card: "#eee",
  cardText: "#222",
  cardBorder: "#ccc",
};

describe("parseButtonShape / parseButtonFill", () => {
  it("accepts valid values", () => {
    expect(parseButtonShape("pill")).toBe("pill");
    expect(parseButtonShape("square")).toBe("square");
    expect(parseButtonFill("outline")).toBe("outline");
    expect(parseButtonFill("soft")).toBe("soft");
  });

  it("falls back to defaults for junk", () => {
    expect(parseButtonShape("bogus")).toBe(DEFAULT_BUTTON_SHAPE);
    expect(parseButtonShape(null)).toBe("rounded");
    expect(parseButtonFill("")).toBe(DEFAULT_BUTTON_FILL);
    expect(parseButtonFill(undefined)).toBe("solid");
  });
});

describe("linkButtonAppearance", () => {
  it("maps shape to border radius", () => {
    expect(linkButtonAppearance(theme, "rounded", "solid").borderRadius).toBe("0.75rem");
    expect(linkButtonAppearance(theme, "pill", "solid").borderRadius).toBe("9999px");
    expect(linkButtonAppearance(theme, "square", "solid").borderRadius).toBe("0.25rem");
  });

  it("solid uses the card colors, border, and shadow", () => {
    const a = linkButtonAppearance(theme, "rounded", "solid");
    expect(a).toMatchObject({
      background: theme.card,
      color: theme.cardText,
      borderColor: theme.cardBorder,
      shadow: true,
    });
  });

  it("outline is transparent with a text-colored border and no shadow", () => {
    const a = linkButtonAppearance(theme, "rounded", "outline");
    expect(a.background).toBe("transparent");
    expect(a.color).toBe(theme.text);
    expect(a.borderColor).toBe(theme.text);
    expect(a.shadow).toBe(false);
  });

  it("soft drops the border and shadow", () => {
    const a = linkButtonAppearance(theme, "rounded", "soft");
    expect(a.background).toBe(theme.card);
    expect(a.borderColor).toBe("transparent");
    expect(a.borderWidth).toBe("0");
    expect(a.shadow).toBe(false);
  });
});

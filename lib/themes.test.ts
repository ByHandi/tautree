import { describe, expect, it } from "vitest";

import {
  CUSTOM_THEME_ID,
  DEFAULT_CUSTOM_PALETTE,
  DEFAULT_THEME,
  THEMES,
  getTheme,
  isHexColor,
  isPresetThemeId,
  isThemeId,
  parseCustomPalette,
} from "./themes";

describe("isHexColor", () => {
  it("accepts 3- and 6-digit hex literals", () => {
    expect(isHexColor("#fff")).toBe(true);
    expect(isHexColor("#FFFFFF")).toBe(true);
    expect(isHexColor("#0a1b2c")).toBe(true);
  });

  it("rejects anything that isn't a plain hex literal", () => {
    // These are the values that would let arbitrary CSS into inline styles.
    expect(isHexColor("url(https://evil.com/x.png)")).toBe(false);
    expect(isHexColor("red")).toBe(false);
    expect(isHexColor("#ggg")).toBe(false);
    expect(isHexColor("#ffff")).toBe(false); // 4 digits
    expect(isHexColor("fff")).toBe(false); // no #
    expect(isHexColor("rgb(0,0,0)")).toBe(false);
    expect(isHexColor("")).toBe(false);
    expect(isHexColor(123)).toBe(false);
    expect(isHexColor(null)).toBe(false);
  });
});

describe("parseCustomPalette", () => {
  it("returns the palette when every field is a valid hex color", () => {
    expect(parseCustomPalette(DEFAULT_CUSTOM_PALETTE)).toEqual(DEFAULT_CUSTOM_PALETTE);
  });

  it("copies only the known fields, dropping extras", () => {
    const parsed = parseCustomPalette({ ...DEFAULT_CUSTOM_PALETTE, evil: "url(x)" });
    expect(parsed).toEqual(DEFAULT_CUSTOM_PALETTE);
    expect(parsed).not.toHaveProperty("evil");
  });

  it("rejects a palette with any non-hex field", () => {
    expect(parseCustomPalette({ ...DEFAULT_CUSTOM_PALETTE, page: "url(x)" })).toBeNull();
    expect(parseCustomPalette({ ...DEFAULT_CUSTOM_PALETTE, text: "#ggg" })).toBeNull();
  });

  it("rejects a palette missing a required field", () => {
    const incomplete: Record<string, unknown> = { ...DEFAULT_CUSTOM_PALETTE };
    delete incomplete.page;
    expect(parseCustomPalette(incomplete)).toBeNull();
  });

  it("rejects non-objects", () => {
    expect(parseCustomPalette(null)).toBeNull();
    expect(parseCustomPalette("nope")).toBeNull();
    expect(parseCustomPalette(undefined)).toBeNull();
  });
});

describe("getTheme", () => {
  it("resolves a known preset id", () => {
    expect(getTheme("ocean").id).toBe("ocean");
  });

  it("falls back to the default for unknown ids", () => {
    expect(getTheme("nope")).toEqual(THEMES[DEFAULT_THEME]);
    expect(getTheme(null)).toEqual(THEMES[DEFAULT_THEME]);
    expect(getTheme(undefined)).toEqual(THEMES[DEFAULT_THEME]);
  });

  it("builds a custom theme from a valid palette", () => {
    const palette = { ...DEFAULT_CUSTOM_PALETTE, page: "#112233" };
    const theme = getTheme(CUSTOM_THEME_ID, palette);
    expect(theme.id).toBe(CUSTOM_THEME_ID);
    expect(theme.page).toBe("#112233");
  });

  it("falls back to default when custom is selected but the palette is invalid", () => {
    expect(getTheme(CUSTOM_THEME_ID, null)).toEqual(THEMES[DEFAULT_THEME]);
    expect(getTheme(CUSTOM_THEME_ID, { page: "url(x)" })).toEqual(THEMES[DEFAULT_THEME]);
  });
});

describe("theme id guards", () => {
  it("isThemeId accepts presets and custom", () => {
    expect(isThemeId("ocean")).toBe(true);
    expect(isThemeId(CUSTOM_THEME_ID)).toBe(true);
    expect(isThemeId("nope")).toBe(false);
  });

  it("isPresetThemeId rejects custom", () => {
    expect(isPresetThemeId("ocean")).toBe(true);
    expect(isPresetThemeId(CUSTOM_THEME_ID)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { DEFAULT_FONT, FONT_OPTIONS, fontStack, parseFont } from "./fonts";

describe("parseFont", () => {
  it("accepts each known font id", () => {
    for (const f of FONT_OPTIONS) expect(parseFont(f.id)).toBe(f.id);
  });

  it("falls back to the default for junk", () => {
    expect(parseFont("bogus")).toBe(DEFAULT_FONT);
    expect(parseFont(null)).toBe(DEFAULT_FONT);
    expect(parseFont(undefined)).toBe(DEFAULT_FONT);
    expect(parseFont("")).toBe(DEFAULT_FONT);
  });
});

describe("fontStack", () => {
  it("returns the matching stack", () => {
    expect(fontStack("serif")).toContain("serif");
    expect(fontStack("mono")).toContain("monospace");
    expect(fontStack("sans")).toContain("--font-sans");
  });
});

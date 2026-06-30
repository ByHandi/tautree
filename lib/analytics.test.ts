import { describe, expect, it } from "vitest";

import { classifyDevice, isBot, referrerLabel } from "./analytics";

describe("classifyDevice", () => {
  it("detects mobile", () => {
    expect(classifyDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)")).toBe("mobile");
    expect(classifyDevice("Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari")).toBe("mobile");
  });

  it("detects tablet", () => {
    expect(classifyDevice("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe("tablet");
    // Android without the "mobile" token is conventionally a tablet.
    expect(classifyDevice("Mozilla/5.0 (Linux; Android 14; SM-X200) Safari")).toBe("tablet");
  });

  it("defaults to desktop", () => {
    expect(classifyDevice("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe("desktop");
    expect(classifyDevice(null)).toBe("desktop");
    expect(classifyDevice("")).toBe("desktop");
  });
});

describe("isBot", () => {
  it("flags crawlers and preview fetchers", () => {
    expect(isBot("Googlebot/2.1")).toBe(true);
    expect(isBot("facebookexternalhit/1.1")).toBe(true);
    expect(isBot("HeadlessChrome/120")).toBe(true);
  });

  it("passes real browsers", () => {
    expect(isBot("Mozilla/5.0 (iPhone) Safari")).toBe(false);
    expect(isBot(null)).toBe(false);
  });
});

describe("referrerLabel", () => {
  it("extracts the registrable host without www", () => {
    expect(referrerLabel("https://www.instagram.com/p/abc", "tautree.com")).toBe("instagram.com");
    expect(referrerLabel("https://t.co/xyz", "tautree.com")).toBe("t.co");
  });

  it("treats missing/own-domain referrers as direct (null)", () => {
    expect(referrerLabel(null, "tautree.com")).toBeNull();
    expect(referrerLabel("", "tautree.com")).toBeNull();
    expect(referrerLabel("https://tautree.com/budi", "tautree.com")).toBeNull();
    expect(referrerLabel("https://www.tautree.com/budi", "tautree.com")).toBeNull();
  });

  it("returns null for unparseable referrers", () => {
    expect(referrerLabel("not a url", "tautree.com")).toBeNull();
  });
});

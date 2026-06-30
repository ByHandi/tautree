import { describe, expect, it } from "vitest";

import {
  ANALYTICS_DEFAULT_DAYS,
  ANALYTICS_MAX_DAYS,
  classifyDevice,
  isBot,
  referrerLabel,
  resolveRange,
} from "./analytics";

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

describe("resolveRange", () => {
  const now = new Date(2026, 5, 30, 15, 0, 0); // 2026-06-30, local

  it("uses an explicit valid range inclusively", () => {
    const { since, until, days } = resolveRange("2026-06-01", "2026-06-10", now);
    expect(since.getFullYear()).toBe(2026);
    expect(since.getMonth()).toBe(5);
    expect(since.getDate()).toBe(1);
    expect(since.getHours()).toBe(0);
    expect(until.getDate()).toBe(10);
    expect(until.getHours()).toBe(23);
    expect(days).toBe(10);
  });

  it("falls back to the default window when params are missing or invalid", () => {
    for (const r of [
      resolveRange(undefined, undefined, now),
      resolveRange("garbage", "2026-06-10", now),
      resolveRange("2026-06-10", "2026-06-01", now), // reversed
    ]) {
      expect(r.days).toBe(ANALYTICS_DEFAULT_DAYS);
      expect(r.until.getDate()).toBe(30);
    }
  });

  it("clamps an over-long span to the max", () => {
    const { days } = resolveRange("2020-01-01", "2026-06-10", now);
    expect(days).toBe(ANALYTICS_MAX_DAYS);
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

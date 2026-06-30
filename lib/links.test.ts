import { describe, expect, it } from "vitest";

import {
  isLinkLive,
  normalizeUrl,
  parseLinkKind,
  parseSchedule,
  parseThumbnail,
  THUMBNAIL_MAX_CHARS,
  TITLE_MAX,
  validateTitle,
} from "./links";

describe("isLinkLive", () => {
  it("is live only when active and the owner isn't suspended", () => {
    expect(isLinkLive({ isActive: true }, { suspended: false })).toBe(true);
  });

  it("is dark when inactive", () => {
    expect(isLinkLive({ isActive: false }, { suspended: false })).toBe(false);
  });

  it("is dark when the owner is suspended, even if active", () => {
    expect(isLinkLive({ isActive: true }, { suspended: true })).toBe(false);
  });

  describe("scheduling window", () => {
    const now = new Date("2026-06-30T12:00:00Z");
    const earlier = new Date("2026-06-30T11:00:00Z");
    const later = new Date("2026-06-30T13:00:00Z");

    it("is live with no bounds", () => {
      expect(isLinkLive({ isActive: true, startsAt: null, endsAt: null }, { suspended: false }, now))
        .toBe(true);
    });

    it("is dark before startsAt and live at/after it", () => {
      expect(isLinkLive({ isActive: true, startsAt: later }, { suspended: false }, now)).toBe(false);
      expect(isLinkLive({ isActive: true, startsAt: now }, { suspended: false }, now)).toBe(true);
      expect(isLinkLive({ isActive: true, startsAt: earlier }, { suspended: false }, now)).toBe(
        true,
      );
    });

    it("is dark at/after endsAt and live before it", () => {
      expect(isLinkLive({ isActive: true, endsAt: now }, { suspended: false }, now)).toBe(false);
      expect(isLinkLive({ isActive: true, endsAt: earlier }, { suspended: false }, now)).toBe(false);
      expect(isLinkLive({ isActive: true, endsAt: later }, { suspended: false }, now)).toBe(true);
    });

    it("is dark inside the window when inactive", () => {
      expect(
        isLinkLive(
          { isActive: false, startsAt: earlier, endsAt: later },
          { suspended: false },
          now,
        ),
      ).toBe(false);
    });
  });
});

describe("parseSchedule", () => {
  it("treats empty strings as no bound (null)", () => {
    expect(parseSchedule("", "")).toEqual({ ok: true, startsAt: null, endsAt: null });
  });

  it("parses ISO timestamps", () => {
    const res = parseSchedule("2026-07-01T10:00:00.000Z", "2026-07-02T10:00:00.000Z");
    expect(res).toMatchObject({ ok: true });
    if (res.ok) {
      expect(res.startsAt?.toISOString()).toBe("2026-07-01T10:00:00.000Z");
      expect(res.endsAt?.toISOString()).toBe("2026-07-02T10:00:00.000Z");
    }
  });

  it("rejects an end at or before the start", () => {
    expect(parseSchedule("2026-07-02T10:00:00.000Z", "2026-07-01T10:00:00.000Z")).toMatchObject({
      ok: false,
    });
    expect(parseSchedule("2026-07-01T10:00:00.000Z", "2026-07-01T10:00:00.000Z")).toMatchObject({
      ok: false,
    });
  });

  it("rejects an unparseable value", () => {
    expect(parseSchedule("not-a-date", "")).toMatchObject({ ok: false });
  });

  it("allows a start with no end and vice versa", () => {
    expect(parseSchedule("2026-07-01T10:00:00.000Z", "")).toMatchObject({ ok: true });
    expect(parseSchedule("", "2026-07-01T10:00:00.000Z")).toMatchObject({ ok: true });
  });
});

describe("parseLinkKind", () => {
  it("recognizes HEADER", () => {
    expect(parseLinkKind("HEADER")).toBe("HEADER");
  });

  it("defaults anything else to LINK", () => {
    expect(parseLinkKind("LINK")).toBe("LINK");
    expect(parseLinkKind("")).toBe("LINK");
    expect(parseLinkKind("header")).toBe("LINK"); // case-sensitive by design
    expect(parseLinkKind("bogus")).toBe("LINK");
  });
});

describe("parseThumbnail", () => {
  const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==";

  it("treats empty as no thumbnail", () => {
    expect(parseThumbnail("")).toEqual({ ok: true, thumbnail: null });
    expect(parseThumbnail("   ")).toEqual({ ok: true, thumbnail: null });
  });

  it("accepts png/jpeg/webp base64 data URIs", () => {
    expect(parseThumbnail(png)).toEqual({ ok: true, thumbnail: png });
    expect(parseThumbnail("data:image/webp;base64,UklGRhoAAABXRUJQ")).toMatchObject({ ok: true });
    expect(parseThumbnail("data:image/jpeg;base64,/9j/4AAQSkZJRg==")).toMatchObject({ ok: true });
  });

  it("rejects non-image and script-capable data URIs", () => {
    expect(parseThumbnail("data:text/html;base64,PHNjcmlwdD4=")).toMatchObject({ ok: false });
    expect(parseThumbnail("data:image/svg+xml;base64,PHN2Zz4=")).toMatchObject({ ok: false });
    expect(parseThumbnail("https://example.com/a.png")).toMatchObject({ ok: false });
  });

  it("rejects an oversized payload", () => {
    const huge = `data:image/png;base64,${"A".repeat(THUMBNAIL_MAX_CHARS)}`;
    expect(parseThumbnail(huge)).toMatchObject({ ok: false });
  });
});

describe("validateTitle", () => {
  it("accepts a normal title", () => {
    expect(validateTitle("My GitHub")).toEqual({ ok: true });
  });

  it("rejects empty / whitespace-only titles", () => {
    expect(validateTitle("")).toMatchObject({ ok: false });
    expect(validateTitle("   ")).toMatchObject({ ok: false });
  });

  it("rejects titles over the max length", () => {
    expect(validateTitle("a".repeat(TITLE_MAX))).toEqual({ ok: true });
    expect(validateTitle("a".repeat(TITLE_MAX + 1))).toMatchObject({ ok: false });
  });
});

describe("normalizeUrl", () => {
  it("adds https:// when the scheme is missing", () => {
    expect(normalizeUrl("example.com")).toEqual({ ok: true, url: "https://example.com/" });
  });

  it("preserves an explicit http(s) scheme, path and query", () => {
    expect(normalizeUrl("http://sub.example.com/a?b=1")).toEqual({
      ok: true,
      url: "http://sub.example.com/a?b=1",
    });
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeUrl("  example.com  ")).toEqual({ ok: true, url: "https://example.com/" });
  });

  it("rejects an empty value", () => {
    expect(normalizeUrl("")).toMatchObject({ ok: false });
  });

  it("rejects dangerous / non-http schemes", () => {
    // The https:// prefix is only added for bare hosts, so these stay non-http
    // and must be rejected — guards against javascript:/data: link injection.
    expect(normalizeUrl("javascript:alert(1)")).toMatchObject({ ok: false });
    expect(normalizeUrl("data:text/html,<script>")).toMatchObject({ ok: false });
  });

  it("rejects hosts without a dot (e.g. localhost)", () => {
    expect(normalizeUrl("localhost")).toMatchObject({ ok: false });
    expect(normalizeUrl("https://localhost")).toMatchObject({ ok: false });
  });
});

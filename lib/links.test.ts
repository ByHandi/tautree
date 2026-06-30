import { describe, expect, it } from "vitest";

import { normalizeUrl, TITLE_MAX, validateTitle } from "./links";

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

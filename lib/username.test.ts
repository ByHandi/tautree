import { describe, expect, it } from "vitest";

import { USERNAME_MAX, USERNAME_MIN, normalizeUsername, validateUsername } from "./username";

describe("validateUsername", () => {
  it("accepts valid lowercase usernames", () => {
    expect(validateUsername("john")).toEqual({ ok: true });
    expect(validateUsername("john_doe")).toEqual({ ok: true });
    expect(validateUsername("a1b2")).toEqual({ ok: true });
  });

  it("enforces length bounds", () => {
    expect(validateUsername("a".repeat(USERNAME_MIN - 1))).toMatchObject({ ok: false });
    expect(validateUsername("a".repeat(USERNAME_MIN))).toEqual({ ok: true });
    expect(validateUsername("a".repeat(USERNAME_MAX))).toEqual({ ok: true });
    expect(validateUsername("a".repeat(USERNAME_MAX + 1))).toMatchObject({ ok: false });
  });

  it("rejects disallowed characters and bad leading char", () => {
    expect(validateUsername("john-doe")).toMatchObject({ ok: false }); // hyphen
    expect(validateUsername("john.doe")).toMatchObject({ ok: false }); // dot
    expect(validateUsername("john doe")).toMatchObject({ ok: false }); // space
    expect(validateUsername("_john")).toMatchObject({ ok: false }); // leading underscore
  });

  it("rejects reserved route names", () => {
    expect(validateUsername("admin")).toMatchObject({ ok: false });
    expect(validateUsername("api")).toMatchObject({ ok: false });
    expect(validateUsername("dashboard")).toMatchObject({ ok: false });
  });
});

describe("normalizeUsername", () => {
  it("lowercases and trims", () => {
    expect(normalizeUsername("  JohnDoe  ")).toBe("johndoe");
  });
});

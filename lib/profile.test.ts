import { describe, expect, it } from "vitest";

import {
  BIO_MAX,
  NAME_MAX,
  isProfilePublic,
  validateAvatarUrl,
  validateBio,
  validateName,
} from "./profile";

describe("isProfilePublic", () => {
  it("is public when not suspended", () => {
    expect(isProfilePublic({ suspended: false })).toBe(true);
  });
  it("is hidden when suspended", () => {
    expect(isProfilePublic({ suspended: true })).toBe(false);
  });
});

describe("validateName", () => {
  it("treats empty as null (falls back to @username)", () => {
    expect(validateName("  ")).toEqual({ ok: true, name: null });
  });
  it("trims and keeps a normal name", () => {
    expect(validateName("  Budi  ")).toEqual({ ok: true, name: "Budi" });
  });
  it("rejects over the max length", () => {
    expect(validateName("a".repeat(NAME_MAX + 1))).toMatchObject({ ok: false });
  });
});

describe("validateBio", () => {
  it("allows empty (null)", () => {
    expect(validateBio("")).toEqual({ ok: true, bio: null });
  });
  it("rejects over the max length", () => {
    expect(validateBio("a".repeat(BIO_MAX + 1))).toMatchObject({ ok: false });
  });
});

describe("validateAvatarUrl", () => {
  it("clears the avatar when empty", () => {
    expect(validateAvatarUrl("")).toEqual({ ok: true, url: null });
  });
  it("adds https:// when missing", () => {
    expect(validateAvatarUrl("cdn.example.com/a.png")).toEqual({
      ok: true,
      url: "https://cdn.example.com/a.png",
    });
  });
  it("rejects dangerous schemes and dotless hosts", () => {
    expect(validateAvatarUrl("javascript:alert(1)")).toMatchObject({ ok: false });
    expect(validateAvatarUrl("https://localhost")).toMatchObject({ ok: false });
  });
});

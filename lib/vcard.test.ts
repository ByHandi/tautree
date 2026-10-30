import { describe, expect, it } from "vitest";

import {
  CONTACT_EMAIL_MAX,
  CONTACT_PHONE_MAX,
  CONTACT_TEXT_MAX,
  buildVCard,
  escapeText,
  foldLine,
  validateContactEmail,
  validateContactPhone,
  validateContactText,
} from "./vcard";

const octets = (s: string) => new TextEncoder().encode(s).length;
const unfold = (s: string) => s.replace(/\r\n /g, "");

describe("validateContactPhone", () => {
  it("treats empty as null", () => {
    expect(validateContactPhone("  ")).toEqual({ ok: true, value: null });
  });
  it("trims and keeps a formatted number", () => {
    expect(validateContactPhone(" +62 (812) 0000.0000 ")).toEqual({
      ok: true,
      value: "+62 (812) 0000.0000",
    });
  });
  it("rejects letters", () => {
    expect(validateContactPhone("call me")).toEqual({
      ok: false,
      reason: "Enter a valid phone number.",
    });
  });
  it("rejects fewer than 6 digits", () => {
    expect(validateContactPhone("+1 234-5")).toMatchObject({ ok: false });
  });
  it("accepts exactly the max length", () => {
    expect(validateContactPhone("1".repeat(CONTACT_PHONE_MAX))).toMatchObject({ ok: true });
  });
  it("rejects one over the max length", () => {
    expect(validateContactPhone("1".repeat(CONTACT_PHONE_MAX + 1))).toEqual({
      ok: false,
      reason: `Phone must be at most ${CONTACT_PHONE_MAX} characters.`,
    });
  });
});

describe("validateContactEmail", () => {
  it("treats empty as null", () => {
    expect(validateContactEmail("")).toEqual({ ok: true, value: null });
  });
  it("trims and lowercases", () => {
    expect(validateContactEmail(" Hello@Example.COM ")).toEqual({
      ok: true,
      value: "hello@example.com",
    });
  });
  it("rejects an address without a domain", () => {
    expect(validateContactEmail("hello@example")).toEqual({
      ok: false,
      reason: "Enter a valid email address.",
    });
  });
  it("rejects an address with a line break", () => {
    expect(validateContactEmail("a@b.co\nTEL:1")).toMatchObject({ ok: false });
  });
  it("accepts exactly the max length", () => {
    const email = `${"a".repeat(CONTACT_EMAIL_MAX - "@example.com".length)}@example.com`;
    expect(validateContactEmail(email)).toMatchObject({ ok: true });
  });
  it("rejects one over the max length", () => {
    const email = `${"a".repeat(CONTACT_EMAIL_MAX + 1 - "@example.com".length)}@example.com`;
    expect(validateContactEmail(email)).toEqual({
      ok: false,
      reason: `Email must be at most ${CONTACT_EMAIL_MAX} characters.`,
    });
  });
});

describe("validateContactText", () => {
  it("treats empty as null", () => {
    expect(validateContactText(" ", "Organization")).toEqual({ ok: true, value: null });
  });
  it("trims a normal value", () => {
    expect(validateContactText("  Acme, Inc.  ", "Organization")).toEqual({
      ok: true,
      value: "Acme, Inc.",
    });
  });
  it("accepts exactly the max length", () => {
    expect(validateContactText("a".repeat(CONTACT_TEXT_MAX), "Job title")).toMatchObject({
      ok: true,
    });
  });
  it("rejects one over the max length, naming the field", () => {
    expect(validateContactText("a".repeat(CONTACT_TEXT_MAX + 1), "Job title")).toEqual({
      ok: false,
      reason: `Job title must be at most ${CONTACT_TEXT_MAX} characters.`,
    });
  });
  it("rejects an embedded line break", () => {
    expect(validateContactText("Acme\r\nEMAIL:evil@x.com", "Organization")).toEqual({
      ok: false,
      reason: "Organization can't contain line breaks.",
    });
  });
});

describe("escapeText", () => {
  it("escapes backslash, comma and semicolon", () => {
    expect(escapeText("a\\b,c;d")).toBe("a\\\\b\\,c\\;d");
  });
  it("turns every kind of line break into \\n", () => {
    expect(escapeText("a\r\nb\nc\rd")).toBe("a\\nb\\nc\\nd");
  });
  it("drops other control characters", () => {
    expect(escapeText("a\u0000b\tc\u007f")).toBe("abc");
  });
});

describe("foldLine", () => {
  it("leaves a short line alone", () => {
    expect(foldLine("FN:Handi")).toBe("FN:Handi");
  });
  it("folds a long line to at most 75 octets per physical line", () => {
    const line = `NOTE:${"x".repeat(200)}`;
    const folded = foldLine(line);
    for (const part of folded.split("\r\n")) expect(octets(part)).toBeLessThanOrEqual(75);
    expect(unfold(folded)).toBe(line);
  });
  it("never splits a multibyte character", () => {
    const line = `NOTE:${"🌳é".repeat(40)}`;
    const folded = foldLine(line);
    for (const part of folded.split("\r\n")) {
      expect(octets(part)).toBeLessThanOrEqual(75);
      expect(part).not.toContain("�");
      expect([...part].every((ch) => ch.codePointAt(0)! < 0xd800 || ch.length === 2)).toBe(true);
    }
    expect(unfold(folded)).toBe(line);
  });
});

describe("buildVCard", () => {
  it("builds a full card with CRLF line endings", () => {
    expect(
      buildVCard({
        name: "Handi",
        url: "https://tautree.app/handi",
        note: "Building Tautree",
        phone: "+62 812-0000-0000",
        email: "hello@example.com",
        org: "Tautree",
        title: "Maker",
      }),
    ).toBe(
      [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "FN:Handi",
        "N:;Handi;;;",
        "ORG:Tautree",
        "TITLE:Maker",
        "TEL;TYPE=CELL:+62 812-0000-0000",
        "EMAIL;TYPE=INTERNET:hello@example.com",
        "NOTE:Building Tautree",
        "URL:https://tautree.app/handi",
        "END:VCARD",
        "",
      ].join("\r\n"),
    );
  });

  it("leaves out empty fields", () => {
    const card = buildVCard({ name: "@handi", url: "https://tautree.app/handi", phone: null });
    expect(card).toBe(
      [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "FN:@handi",
        "N:;@handi;;;",
        "URL:https://tautree.app/handi",
        "END:VCARD",
        "",
      ].join("\r\n"),
    );
  });

  it("can't be tricked into adding properties through a field value", () => {
    const card = buildVCard({
      name: "Eve\r\nEMAIL:evil@example.com",
      url: "https://tautree.app/eve\r\nTEL:000",
      note: "hi\nEMAIL;TYPE=INTERNET:evil@example.com",
      org: "Acme;Evil",
    });
    const lines = unfold(card).split("\r\n");
    expect(lines.filter((l) => l.startsWith("EMAIL"))).toEqual([]);
    expect(lines.filter((l) => l.startsWith("TEL"))).toEqual([]);
    expect(lines).toContain("ORG:Acme\\;Evil");
    expect(lines).toContain("NOTE:hi\\nEMAIL\\;TYPE=INTERNET:evil@example.com");
  });
});

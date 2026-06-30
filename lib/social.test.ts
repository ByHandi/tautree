import { describe, expect, it } from "vitest";

import { detectPlatform } from "./social";

describe("detectPlatform", () => {
  it("matches known platforms by host", () => {
    expect(detectPlatform("https://github.com/handi")).toBe("github");
    expect(detectPlatform("https://instagram.com/handi")).toBe("instagram");
    expect(detectPlatform("https://tiktok.com/@handi")).toBe("tiktok");
  });

  it("maps aliases to a single id (twitter/x, youtu.be)", () => {
    expect(detectPlatform("https://twitter.com/handi")).toBe("x");
    expect(detectPlatform("https://x.com/handi")).toBe("x");
    expect(detectPlatform("https://youtu.be/abc")).toBe("youtube");
    expect(detectPlatform("https://youtube.com/@handi")).toBe("youtube");
  });

  it("ignores www. and matches subdomains", () => {
    expect(detectPlatform("https://www.github.com/handi")).toBe("github");
    expect(detectPlatform("https://open.spotify.com/user/handi")).toBe("spotify");
    expect(detectPlatform("https://handi.substack.com")).toBe("substack");
  });

  it("returns null for unknown hosts and invalid URLs", () => {
    expect(detectPlatform("https://example.com")).toBeNull();
    expect(detectPlatform("https://notgithub.com.evil.com")).toBeNull();
    expect(detectPlatform("not a url")).toBeNull();
  });

  it("does not match a host that merely contains a known name", () => {
    // endsWith(".github.com") guards against "mygithub.com" false positives.
    expect(detectPlatform("https://mygithub.com")).toBeNull();
  });
});

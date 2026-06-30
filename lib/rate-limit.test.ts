import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clientIp, rateLimit } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to `limit` requests per window, then blocks", () => {
    const opts = { limit: 2, windowMs: 1000 };
    expect(rateLimit("a", opts)).toMatchObject({ success: true, remaining: 1 });
    expect(rateLimit("a", opts)).toMatchObject({ success: true, remaining: 0 });
    expect(rateLimit("a", opts)).toMatchObject({ success: false, remaining: 0 });
  });

  it("resets once the window elapses", () => {
    const opts = { limit: 1, windowMs: 1000 };
    expect(rateLimit("b", opts).success).toBe(true);
    expect(rateLimit("b", opts).success).toBe(false);

    vi.setSystemTime(1001); // past resetAt
    expect(rateLimit("b", opts).success).toBe(true);
  });

  it("tracks keys independently", () => {
    const opts = { limit: 1, windowMs: 1000 };
    expect(rateLimit("k1", opts).success).toBe(true);
    expect(rateLimit("k2", opts).success).toBe(true);
    expect(rateLimit("k1", opts).success).toBe(false);
  });
});

describe("clientIp", () => {
  it("takes the first entry of x-forwarded-for", () => {
    const req = new Request("https://x.test", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip then 'unknown'", () => {
    expect(clientIp(new Request("https://x.test", { headers: { "x-real-ip": "9.9.9.9" } }))).toBe(
      "9.9.9.9",
    );
    expect(clientIp(new Request("https://x.test"))).toBe("unknown");
  });
});

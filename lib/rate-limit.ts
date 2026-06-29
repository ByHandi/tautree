/**
 * Minimal in-memory fixed-window rate limiter.
 *
 * NOTE: state lives in the process, so on serverless/multi-instance hosting
 * (e.g. Vercel) each instance has its own window — it throttles naive abuse but
 * is not a global guarantee. Swap the store for Upstash/Redis when that matters.
 */

type Bucket = { count: number; resetAt: number };

const globalForRateLimit = globalThis as unknown as {
  rateLimitStore: Map<string, Bucket> | undefined;
};

const store = globalForRateLimit.rateLimitStore ?? new Map<string, Bucket>();
if (process.env.NODE_ENV !== "production") globalForRateLimit.rateLimitStore = store;

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

export type RateLimitOptions = {
  /** Max requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
};

/**
 * Consume one token for `key`. Returns whether the request is allowed plus how
 * many remain in the current window. Expired buckets are reset lazily on access.
 */
export function rateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });

    // Opportunistic cleanup so the map doesn't grow unbounded.
    if (store.size > 10_000) {
      for (const [k, b] of store) if (b.resetAt <= now) store.delete(k);
    }

    return { success: true, remaining: limit - 1, resetAt };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/** Best-effort client IP from proxy headers; falls back to a constant. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

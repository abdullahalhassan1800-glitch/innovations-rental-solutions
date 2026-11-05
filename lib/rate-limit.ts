type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

/**
 * Small in-memory fixed-window rate limiter. Suitable for a single Node
 * instance / demo deployment. For multi-region production, swap this for a
 * Redis-backed limiter (see README).
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (now - lastSweep > 60_000) {
    for (const [k, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(k);
    }
    lastSweep = now;
  }

  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { ok: true, remaining: limit - existing.count, retryAfter: 0 };
}

export function rateLimitResponse(retryAfter: number) {
  return {
    status: 429,
    body: { error: "Too many attempts. Please wait a moment and try again.", retryAfter },
  };
}

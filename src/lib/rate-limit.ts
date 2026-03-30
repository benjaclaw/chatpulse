interface RateBucket {
  count: number;
  resetAt: number;
}

const CLEANUP_INTERVAL = 5 * 60_000; // 5 minutes

export interface RateLimiter {
  check(key: string): boolean;
}

/**
 * Creates an in-memory rate limiter with automatic cleanup of expired entries.
 */
export function createRateLimiter(limit: number, windowMs = 60_000): RateLimiter {
  const map = new Map<string, RateBucket>();
  let lastCleanup = Date.now();

  function cleanup(): void {
    const now = Date.now();
    if (now - lastCleanup < CLEANUP_INTERVAL) return;
    lastCleanup = now;
    for (const [key, bucket] of map) {
      if (now > bucket.resetAt) map.delete(key);
    }
  }

  return {
    check(key: string): boolean {
      cleanup();
      const now = Date.now();
      const bucket = map.get(key);
      if (!bucket || now > bucket.resetAt) {
        map.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      bucket.count++;
      return bucket.count <= limit;
    },
  };
}

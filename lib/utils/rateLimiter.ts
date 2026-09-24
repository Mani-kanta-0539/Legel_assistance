/**
 * ClauseGuard In-Memory Rate Limiter
 *
 * Implements a sliding-window token-bucket algorithm to protect API routes
 * from abuse and brute-force attacks. Designed to work in both Node.js
 * and Vercel Edge runtime environments.
 *
 * Limits: 30 requests / 60-second window per unique identifier (IP).
 */

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

// Global store — survives across requests within the same serverless instance
const buckets = new Map<string, TokenBucket>();

const WINDOW_MS = 60_000; // 60 seconds
const MAX_TOKENS = 30; // max requests per window

/** Prune stale buckets to prevent unbounded memory growth */
function pruneExpired(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > WINDOW_MS * 2) {
      buckets.delete(key);
    }
  }
}

/**
 * Check whether an identifier (e.g., an IP address) is within rate limits.
 *
 * @param identifier - Unique key (IP address, user ID, etc.)
 * @returns `{ allowed: boolean; remaining: number; resetInMs: number }`
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
} {
  // Periodic cleanup — 1 in 100 chance per call to avoid contention
  if (Math.random() < 0.01) pruneExpired();

  const now = Date.now();
  let bucket = buckets.get(identifier);

  if (!bucket || now - bucket.lastRefill >= WINDOW_MS) {
    // New window — reset bucket
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(identifier, bucket);
  }

  if (bucket.tokens <= 0) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: WINDOW_MS - (now - bucket.lastRefill),
    };
  }

  bucket.tokens -= 1;
  return {
    allowed: true,
    remaining: bucket.tokens,
    resetInMs: WINDOW_MS - (now - bucket.lastRefill),
  };
}

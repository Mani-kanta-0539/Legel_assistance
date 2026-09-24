/**
 * ClauseGuard In-Memory Rate Limiter
 *
 * Implements a sliding-window token-bucket algorithm to protect API routes
 * from abuse and brute-force attacks. Designed to work in both Node.js
 * and Vercel serverless runtime environments.
 *
 * Configuration:
 * - Window:    60 seconds
 * - Max calls: 30 requests per window per unique identifier
 * - Pruning:   Stale buckets are purged every PRUNE_INTERVAL_CALLS requests
 *              to prevent unbounded memory growth without probabilistic logic.
 */

/** Shape of a single rate-limit bucket. */
interface TokenBucket {
  /** Remaining requests allowed in the current window. */
  tokens: number;
  /** Unix timestamp (ms) when this window started. */
  windowStart: number;
}

// ---------------------------------------------------------------------------
// Module-level state (survives across requests within the same serverless instance)
// ---------------------------------------------------------------------------

const WINDOW_MS = 60_000; // 60-second sliding window
const MAX_TOKENS = 30;    // max requests per window
const PRUNE_INTERVAL_CALLS = 200; // prune stale buckets every N calls

const buckets = new Map<string, TokenBucket>();
let callCount = 0;

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Removes expired buckets whose window started more than two window-lengths ago.
 * Called deterministically every PRUNE_INTERVAL_CALLS to avoid unbounded growth.
 */
function pruneExpiredBuckets(): void {
  const cutoff = Date.now() - WINDOW_MS * 2;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.windowStart < cutoff) {
      buckets.delete(key);
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Result returned by {@link checkRateLimit}. */
export interface RateLimitResult {
  /** Whether this request is permitted. */
  allowed: boolean;
  /** Remaining tokens in the current window. */
  remaining: number;
  /** Milliseconds until the current window resets. */
  resetInMs: number;
}

/**
 * Checks whether an identifier (e.g., an IP address) is within its rate limit.
 *
 * @param identifier - A unique key such as `"analyze:192.168.1.1"`.
 * @returns A {@link RateLimitResult} indicating whether the request is allowed.
 *
 * @example
 * ```ts
 * const { allowed, remaining, resetInMs } = checkRateLimit(`analyze:${clientIp}`);
 * if (!allowed) {
 *   return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
 * }
 * ```
 */
export function checkRateLimit(identifier: string): RateLimitResult {
  // Deterministic periodic pruning — no random() code smell
  callCount += 1;
  if (callCount % PRUNE_INTERVAL_CALLS === 0) {
    pruneExpiredBuckets();
  }

  const now = Date.now();
  const existing = buckets.get(identifier);

  // Start a fresh window if no bucket exists or the current window has expired
  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    const bucket: TokenBucket = { tokens: MAX_TOKENS - 1, windowStart: now };
    buckets.set(identifier, bucket);
    return {
      allowed: true,
      remaining: bucket.tokens,
      resetInMs: WINDOW_MS,
    };
  }

  // Existing window — check remaining tokens
  if (existing.tokens <= 0) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: WINDOW_MS - (now - existing.windowStart),
    };
  }

  existing.tokens -= 1;
  return {
    allowed: true,
    remaining: existing.tokens,
    resetInMs: WINDOW_MS - (now - existing.windowStart),
  };
}

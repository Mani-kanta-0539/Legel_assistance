import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkRateLimit } from "../../lib/utils/rateLimiter";

// Reset module state between tests to isolate bucket storage
// (The module keeps a global Map — we work around it by using unique keys per test)

describe("Rate Limiter — Token Bucket Algorithm", () => {
  it("should allow requests within the limit window", () => {
    const id = "test-ip-allow-1";
    // First request should always be allowed
    const result = checkRateLimit(id);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBeLessThan(30);
  });

  it("should consume a token on each allowed call", () => {
    const id = "test-ip-consume-1";
    const first = checkRateLimit(id);
    const second = checkRateLimit(id);
    expect(second.remaining).toBe(first.remaining - 1);
  });

  it("should block after exceeding the 30-request limit", () => {
    const id = `test-ip-exhaust-${Date.now()}`; // unique key
    // Exhaust all 30 tokens
    for (let i = 0; i < 30; i++) {
      checkRateLimit(id);
    }
    // 31st request should be blocked
    const blocked = checkRateLimit(id);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("should return a non-zero resetInMs when blocked", () => {
    const id = `test-ip-reset-${Date.now()}`;
    for (let i = 0; i < 30; i++) {
      checkRateLimit(id);
    }
    const blocked = checkRateLimit(id);
    expect(blocked.resetInMs).toBeGreaterThan(0);
    expect(blocked.resetInMs).toBeLessThanOrEqual(60_000);
  });

  it("should independently track different identifiers", () => {
    const idA = `ip-a-${Date.now()}`;
    const idB = `ip-b-${Date.now()}`;
    // Exhaust identifier A
    for (let i = 0; i < 30; i++) {
      checkRateLimit(idA);
    }
    // Identifier B should still be allowed
    const resultB = checkRateLimit(idB);
    expect(resultB.allowed).toBe(true);
  });
});

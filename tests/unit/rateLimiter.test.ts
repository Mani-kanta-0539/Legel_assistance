import { describe, it, expect } from "vitest";
import { checkRateLimit } from "../../lib/utils/rateLimiter";

describe("Rate Limiter — Token Bucket Algorithm", () => {
  it("should allow the first request and return remaining < MAX_TOKENS", () => {
    const id = `test-allow-${Date.now()}-${Math.random()}`;
    const result = checkRateLimit(id);
    expect(result.allowed).toBe(true);
    // First call consumes 1 token: remaining = MAX_TOKENS - 1 = 29
    expect(result.remaining).toBe(29);
  });

  it("should consume one token per call", () => {
    const id = `test-consume-${Date.now()}-${Math.random()}`;
    const first = checkRateLimit(id);
    const second = checkRateLimit(id);
    expect(second.remaining).toBe(first.remaining - 1);
  });

  it("should block after exhausting all 30 tokens", () => {
    const id = `test-exhaust-${Date.now()}-${Math.random()}`;
    // First call gives remaining=29, so 29 more calls exhaust the bucket
    for (let i = 0; i < 30; i++) {
      checkRateLimit(id);
    }
    const blocked = checkRateLimit(id);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("should return a positive resetInMs when blocked", () => {
    const id = `test-reset-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 30; i++) {
      checkRateLimit(id);
    }
    const blocked = checkRateLimit(id);
    expect(blocked.resetInMs).toBeGreaterThan(0);
    expect(blocked.resetInMs).toBeLessThanOrEqual(60_000);
  });

  it("should track different identifiers independently", () => {
    const idA = `ip-a-${Date.now()}-${Math.random()}`;
    const idB = `ip-b-${Date.now()}-${Math.random()}`;
    for (let i = 0; i < 30; i++) {
      checkRateLimit(idA);
    }
    const resultA = checkRateLimit(idA);
    const resultB = checkRateLimit(idB);
    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });
});

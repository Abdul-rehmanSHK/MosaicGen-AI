import { Redis } from "@upstash/redis/cloudflare";
import { Ratelimit } from "@upstash/ratelimit";

// Detect if Upstash Redis credentials are provided
const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Production Redis Client
export const redis = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

/**
 * In-memory fallback for local development or when Redis is not yet configured.
 * Implements a clean sliding-window rate limiter with the exact same response signature.
 */
class InMemorySlidingWindowLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async limit(identifier: string) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const timestamps = this.requests.get(identifier) || [];
    const validTimestamps = timestamps.filter((t) => t > windowStart);

    if (validTimestamps.length >= this.maxRequests) {
      const oldestInWindow = validTimestamps[0];
      const reset = oldestInWindow + this.windowMs;
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset,
      };
    }

    validTimestamps.push(now);
    this.requests.set(identifier, validTimestamps);

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - validTimestamps.length,
      reset: now + this.windowMs,
    };
  }
}

/**
 * 1. Global Blanket Rate Limiter for Middleware:
 * Allows 50 requests per 10 seconds per IP address to block DDoS and scraping bots.
 */
export const globalRateLimiter = isUpstashConfigured && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(50, "10 s"),
      analytics: true,
      prefix: "ratelimit:global",
    })
  : new InMemorySlidingWindowLimiter(50, 10 * 1000);

/**
 * 2. Strict AI Generation Rate Limiter:
 * Strictly caps at 5 AI generations per 60 seconds per User ID / IP to prevent quota draining.
 */
export const aiGenerationRateLimiter = isUpstashConfigured && redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "ratelimit:ai_generate",
    })
  : new InMemorySlidingWindowLimiter(5, 60 * 1000);

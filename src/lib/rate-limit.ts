import { Errors } from "./errors";

// In-memory rate limit map keyed by client IP.
// NOTE: This is best-effort on serverless — it resets on cold start.
// Each IP is allowed 20 requests per hour across both API routes.

interface RateLimitEntry {
  count: number;
  windowStart: number; // epoch ms
}

const map = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 20;

export function checkRateLimit(request: Request): void {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

  const now = Date.now();
  const entry = map.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    map.set(ip, { count: 1, windowStart: now });
    return;
  }

  if (entry.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    throw Errors.rateLimited(retryAfterSeconds);
  }

  entry.count++;
}

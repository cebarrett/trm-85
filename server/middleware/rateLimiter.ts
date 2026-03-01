import type { Request, Response, NextFunction } from "express";

interface BucketEntry {
  tokens: number;
  lastRefill: number;
}

const MAX_TOKENS = 30;
const REFILL_INTERVAL_MS = 60_000; // 1 minute
const buckets = new Map<string, BucketEntry>();

function getClientIp(request: Request): string {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return request.ip ?? "unknown";
}

export function rateLimiter(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const ip = getClientIp(request);
  const now = Date.now();

  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(ip, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  if (elapsed >= REFILL_INTERVAL_MS) {
    bucket.tokens = MAX_TOKENS;
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    response.status(429).json({
      error: "Machine overheated — try again in a moment",
    });
    return;
  }

  bucket.tokens -= 1;
  next();
}

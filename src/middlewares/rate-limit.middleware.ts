import { NextFunction, Request, Response } from "express";

import { AppError } from "@/errors/app-error";

type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
  now?: () => number;
  keyPrefix?: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export function createInMemoryRateLimiter({
  maxRequests,
  windowMs,
  now = Date.now,
  keyPrefix = "global"
}: RateLimitOptions) {
  const buckets = new Map<string, RateLimitEntry>();

  return (req: Request, res: Response, next: NextFunction) => {
    const currentTime = now();
    const key = `${keyPrefix}:${req.ip ?? "unknown"}:${req.method}:${req.route?.path ?? req.path}`;
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= currentTime) {
      buckets.set(key, {
        count: 1,
        resetAt: currentTime + windowMs
      });
      next();
      return;
    }

    existing.count += 1;

    if (existing.count > maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - currentTime) / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      next(new AppError("Too many requests. Please try again later.", 429));
      return;
    }

    next();
  };
}

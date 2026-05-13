import { NextFunction, Request, Response } from "express";

import prisma from "@/configs/prisma";
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

export function createDatabaseBackedRateLimiter({
  maxRequests,
  windowMs,
  now = Date.now,
  keyPrefix = "global"
}: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentTime = now();
      const currentDate = new Date(currentTime);
      const nextResetDate = new Date(currentTime + windowMs);
      const key = `${keyPrefix}:${req.ip ?? "unknown"}:${req.method}:${req.route?.path ?? req.path}`;

      const shouldAllow = await prisma.$transaction(async (tx) => {
        const bucket = await tx.rateLimitBucket.findUnique({
          where: { key }
        });

        if (!bucket || bucket.resetAt <= currentDate) {
          await tx.rateLimitBucket.upsert({
            where: { key },
            update: {
              count: 1,
              resetAt: nextResetDate
            },
            create: {
              key,
              count: 1,
              resetAt: nextResetDate
            }
          });

          return {
            allowed: true,
            retryAfterSeconds: 0
          };
        }

        const nextCount = bucket.count + 1;

        await tx.rateLimitBucket.update({
          where: { key },
          data: {
            count: nextCount
          }
        });

        return {
          allowed: nextCount <= maxRequests,
          retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt.getTime() - currentTime) / 1000))
        };
      });

      if (!shouldAllow.allowed) {
        res.setHeader("Retry-After", String(shouldAllow.retryAfterSeconds));
        next(new AppError("Too many requests. Please try again later.", 429));
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

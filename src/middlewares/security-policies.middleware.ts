import { env } from "@/configs/env";
import { createDatabaseBackedRateLimiter } from "@/middlewares/rate-limit.middleware";

export const authRateLimit = createDatabaseBackedRateLimiter({
  keyPrefix: "auth",
  maxRequests: env.AUTH_RATE_LIMIT_MAX,
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS
});

export const mutationRateLimit = createDatabaseBackedRateLimiter({
  keyPrefix: "mutation",
  maxRequests: env.WRITE_RATE_LIMIT_MAX,
  windowMs: env.WRITE_RATE_LIMIT_WINDOW_MS
});

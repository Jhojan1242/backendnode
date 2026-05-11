import { env } from "@/configs/env";
import { createInMemoryRateLimiter } from "@/middlewares/rate-limit.middleware";

export const authRateLimit = createInMemoryRateLimiter({
  keyPrefix: "auth",
  maxRequests: env.AUTH_RATE_LIMIT_MAX,
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS
});

export const mutationRateLimit = createInMemoryRateLimiter({
  keyPrefix: "mutation",
  maxRequests: env.WRITE_RATE_LIMIT_MAX,
  windowMs: env.WRITE_RATE_LIMIT_WINDOW_MS
});

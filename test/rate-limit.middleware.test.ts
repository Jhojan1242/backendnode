import { describe, expect, it, vi } from "vitest";

import { createInMemoryRateLimiter } from "../dist/middlewares/rate-limit.middleware.js";

function createMockResponse() {
  return {
    headers: {} as Record<string, string>,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    }
  };
}

describe("rate limit middleware", () => {
  it("allows requests under the configured limit", () => {
    let currentTime = 1_000;
    const limiter = createInMemoryRateLimiter({
      keyPrefix: "test",
      maxRequests: 2,
      windowMs: 1_000,
      now: () => currentTime
    });
    const next = vi.fn();
    const response = createMockResponse();
    const request = {
      ip: "127.0.0.1",
      method: "POST",
      path: "/auth/login",
      route: {
        path: "/auth/login"
      }
    };

    limiter(request as never, response as never, next);
    limiter(request as never, response as never, next);

    expect(next).toHaveBeenCalledTimes(2);
    expect(next).toHaveBeenNthCalledWith(1);
    expect(next).toHaveBeenNthCalledWith(2);

    currentTime += 10;
  });

  it("rejects requests above the configured limit and sets retry-after", () => {
    const limiter = createInMemoryRateLimiter({
      keyPrefix: "test",
      maxRequests: 1,
      windowMs: 1_000,
      now: () => 5_000
    });
    const next = vi.fn();
    const response = createMockResponse();
    const request = {
      ip: "127.0.0.1",
      method: "POST",
      path: "/auth/login",
      route: {
        path: "/auth/login"
      }
    };

    limiter(request as never, response as never, next);
    limiter(request as never, response as never, next);

    expect(response.headers["Retry-After"]).toBe("1");
    expect(next).toHaveBeenNthCalledWith(2, expect.objectContaining({ statusCode: 429 }));
  });
});

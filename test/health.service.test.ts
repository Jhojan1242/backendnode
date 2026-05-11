import { beforeEach, describe, expect, it, vi } from "vitest";

import prisma from "../dist/configs/prisma.js";
import { healthService } from "../dist/services/health.service.js";

describe("healthService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(prisma, "$queryRaw").mockResolvedValue([{ ok: 1 }] as never);
  });

  it("returns a healthy status payload", async () => {
    const result = await healthService();

    expect(result.status).toBe("ok");
    expect(result.environment).toBeDefined();
    expect(result.database).toBe("up");
    expect(new Date(result.timestamp).toString()).not.toBe("Invalid Date");
  });

  it("checks database connectivity before reporting healthy status", async () => {
    await healthService();

    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });
});

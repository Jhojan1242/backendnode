import { describe, expect, it } from "vitest";

import { healthService } from "../dist/services/health.service.js";

describe("healthService", () => {
  it("returns a healthy status payload", async () => {
    const result = await healthService();

    expect(result.status).toBe("ok");
    expect(result.environment).toBeDefined();
    expect(new Date(result.timestamp).toString()).not.toBe("Invalid Date");
  });
});

import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "../dist/schemas/auth.schema.js";

describe("auth schemas", () => {
  it("accepts a valid registration payload", async () => {
    const parsed = await registerSchema.parseAsync({
      body: {
        email: "runner@example.com",
        username: "runner_demo",
        firstName: "Runner",
        lastName: "Demo",
        password: "Password123!",
        role: "RUNNER"
      }
    });

    expect(parsed.body.email).toBe("runner@example.com");
  });

  it("rejects an invalid login payload", async () => {
    await expect(
      loginSchema.parseAsync({
        body: {
          emailOrUsername: "",
          password: "short"
        }
      })
    ).rejects.toThrow();
  });
});

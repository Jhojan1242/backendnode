import { describe, expect, it } from "vitest";

import { blockTeamMemberSchema, teamMemberParamsSchema } from "../dist/schemas/team.schema.js";

describe("team moderation schemas", () => {
  it("accepts valid team member removal params", async () => {
    const parsed = await teamMemberParamsSchema.parseAsync({
      params: {
        teamId: "ckq2v8w9x0000abc123456789",
        memberId: "ckq2v8w9x0001abc123456789"
      }
    });

    expect(parsed.params.teamId).toBe("ckq2v8w9x0000abc123456789");
  });

  it("rejects blocking a runner without a meaningful reason", async () => {
    await expect(
      blockTeamMemberSchema.parseAsync({
        params: {
          teamId: "ckq2v8w9x0000abc123456789"
        },
        body: {
          userId: "ckq2v8w9x0001abc123456789",
          reason: "bad"
        }
      })
    ).rejects.toThrow();
  });
});

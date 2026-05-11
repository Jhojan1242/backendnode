import { describe, expect, it } from "vitest";

import { buildCorsOptions, isOriginAllowed, parseAllowedOrigins } from "../dist/configs/security.js";
import { privateUserSelect, publicUserSelect } from "../dist/services/user.selectors.js";

describe("security config", () => {
  it("parses comma separated origins", () => {
    expect(parseAllowedOrigins("http://localhost:5173, https://app.example.com")).toEqual([
      "http://localhost:5173",
      "https://app.example.com"
    ]);
  });

  it("blocks unknown browser origins in production", () => {
    expect(
      isOriginAllowed("https://unknown.example.com", {
        nodeEnv: "production",
        corsAllowedOrigins: "https://app.example.com"
      })
    ).toBe(false);
  });

  it("allows localhost style development usage when allowlist is empty", () => {
    expect(
      isOriginAllowed("http://localhost:5173", {
        nodeEnv: "development"
      })
    ).toBe(true);
  });

  it("builds cors options that allow server to server requests without origin", () => {
    const options = buildCorsOptions({ nodeEnv: "production", corsAllowedOrigins: "https://app.example.com" });

    options.origin?.(undefined, (_error, allowed) => {
      expect(allowed).toBe(true);
    });
  });
});

describe("user selectors", () => {
  it("does not expose email on public user payloads", () => {
    expect("email" in publicUserSelect).toBe(false);
  });

  it("keeps email available on private profile payloads", () => {
    expect("email" in privateUserSelect).toBe(true);
  });
});

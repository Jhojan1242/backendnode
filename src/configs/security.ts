import type { CorsOptions } from "cors";

export type SecurityConfigInput = {
  nodeEnv: "development" | "test" | "production";
  corsAllowedOrigins?: string;
};

export function parseAllowedOrigins(value?: string) {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isOriginAllowed(origin: string | undefined, config: SecurityConfigInput) {
  if (!origin) {
    return true;
  }

  const allowedOrigins = parseAllowedOrigins(config.corsAllowedOrigins);

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return config.nodeEnv !== "production" && allowedOrigins.length === 0;
}

export function buildCorsOptions(config: SecurityConfigInput): CorsOptions {
  return {
    origin(origin, callback) {
      callback(null, isOriginAllowed(origin, config));
    }
  };
}

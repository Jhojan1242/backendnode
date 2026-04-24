import { env } from "@/configs/env";
import { HealthStatus } from "@/types/health.types";

export async function healthService(): Promise<HealthStatus> {
  return {
    status: "ok",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
}

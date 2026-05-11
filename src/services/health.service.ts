import prisma from "@/configs/prisma";
import { env } from "@/configs/env";
import { HealthStatus } from "@/types/health.types";

export async function healthService(): Promise<HealthStatus> {
  await prisma.$queryRaw`SELECT 1`;

  return {
    status: "ok",
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    database: "up"
  };
}

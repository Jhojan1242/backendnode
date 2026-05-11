export type HealthStatus = {
  status: "ok";
  environment: "development" | "test" | "production";
  timestamp: string;
  database: "up";
};

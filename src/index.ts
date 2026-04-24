import app from "@/app";
import prisma from "@/configs/prisma";
import { env } from "@/configs/env";


const port = env.PORT 
const server = app.listen(port, () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});

server.on("error", (error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

async function gracefulShutdown(signal: string) {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => {
  void gracefulShutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void gracefulShutdown("SIGTERM");
});

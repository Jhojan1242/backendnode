import app from "./app";
import prisma from "./configs/prisma";
import { env } from "./configs/env";

const server = app.listen(env.PORT, () => {
	console.log(`Server running on http://localhost:${env.PORT}`);
});

async function gracefulShutdown(signal: string) {
	console.log(`Received ${signal}. Closing server...`);

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

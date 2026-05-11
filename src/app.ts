import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "@/configs/env";
import { buildCorsOptions } from "@/configs/security";
import { globalErrorHandler, notFoundHandler } from "@/middlewares/error.middleware";
import apiRouter from "@/routes";

const app = express();

app.use(helmet());
app.use(cors(buildCorsOptions({ nodeEnv: env.NODE_ENV, corsAllowedOrigins: env.CORS_ALLOWED_ORIGINS })));
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;

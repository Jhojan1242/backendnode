import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { globalErrorHandler, notFoundHandler } from "@/middlewares/error.middleware";
import apiRouter from "@/routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1", apiRouter);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;

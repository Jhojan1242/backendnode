import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { sendSuccessResponse } from "./common/http/send-response";
import { globalErrorHandler, notFoundHandler } from "./common/middlewares/error.middleware";
import rootRouter from "./routes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (_req, res) => {
  return sendSuccessResponse(res, {
    message: "Runner Social API",
    data: {
      version: "v1"
    }
  });
});

app.use("/api/v1", rootRouter);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;

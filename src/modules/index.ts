import { Router } from "express";

import healthRouter from "./health/health.routes";

const moduleRouter = Router();

moduleRouter.use("/health", healthRouter);

export default moduleRouter;

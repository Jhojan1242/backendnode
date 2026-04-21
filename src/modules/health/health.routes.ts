import { Router } from "express";

import { asyncHandler } from "../../common/utils/async-handler";
import { getHealth } from "./health.controller";

const healthRouter = Router();

healthRouter.get("/", asyncHandler(getHealth));

export default healthRouter;

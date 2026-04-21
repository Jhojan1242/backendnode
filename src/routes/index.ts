import { Router } from "express";

import moduleRouter from "../modules";

const router = Router();

router.use(moduleRouter);

export default router;

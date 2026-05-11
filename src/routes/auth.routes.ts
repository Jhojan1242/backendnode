import { Router } from "express";

import { getCoachArea, getMe, login, register } from "@/controllers/auth.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { authRateLimit } from "@/middlewares/security-policies.middleware";
import { validateRequest } from "@/middlewares/validate-request.middleware";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";
import { asyncHandler } from "@/utils/async-handler";

const authRouter = Router();

authRouter.post("/register", authRateLimit, validateRequest(registerSchema), asyncHandler(register));
authRouter.post("/login", authRateLimit, validateRequest(loginSchema), asyncHandler(login));
authRouter.get("/me", asyncHandler(requireAuth), asyncHandler(getMe));
authRouter.get(
  "/coach-area",
  asyncHandler(requireAuth),
  requireRole("COACH", "ADMIN"),
  asyncHandler(getCoachArea)
);

export default authRouter;

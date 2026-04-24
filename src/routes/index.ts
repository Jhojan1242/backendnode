import { Router } from "express";

import adminRouter from "@/routes/admin.routes";
import authRouter from "@/routes/auth.routes";
import healthRouter from "@/routes/health.routes";
import notificationRouter from "@/routes/notification.routes";
import postRouter from "@/routes/post.routes";
import teamRouter from "@/routes/team.routes";
import userRouter from "@/routes/user.routes";

const router = Router();

router.use("/admin", adminRouter);
router.use("/auth", authRouter);
router.use("/health", healthRouter);
router.use("/notifications", notificationRouter);
router.use("/posts", postRouter);
router.use("/teams", teamRouter);
router.use("/users", userRouter);

export default router;

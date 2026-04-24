import { Router } from "express";

import { getMyNotifications, readNotification } from "@/controllers/notification.controller";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validate-request.middleware";
import { listNotificationsQuerySchema, notificationIdParamSchema } from "@/schemas/notification.schema";
import { asyncHandler } from "@/utils/async-handler";

const notificationRouter = Router();

notificationRouter.get(
  "/",
  asyncHandler(requireAuth),
  validateRequest(listNotificationsQuerySchema),
  asyncHandler(getMyNotifications)
);
notificationRouter.patch(
  "/:notificationId/read",
  asyncHandler(requireAuth),
  validateRequest(notificationIdParamSchema),
  asyncHandler(readNotification)
);

export default notificationRouter;

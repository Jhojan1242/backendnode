import { Router } from "express";

import {
  approveCoach,
  createModerationReport,
  getReports,
  patchUserStatus,
  removeCommentAsAdmin,
  removePostAsAdmin,
  resolveModerationReport
} from "@/controllers/admin.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validate-request.middleware";
import {
  coachValidationSchema,
  commentModerationSchema,
  createReportSchema,
  postModerationSchema,
  resolveReportSchema,
  updateUserStatusSchema
} from "@/schemas/admin.schema";
import { asyncHandler } from "@/utils/async-handler";

const adminRouter = Router();

adminRouter.post(
  "/reports",
  asyncHandler(requireAuth),
  validateRequest(createReportSchema),
  asyncHandler(createModerationReport)
);
adminRouter.get("/reports", asyncHandler(requireAuth), requireRole("ADMIN"), asyncHandler(getReports));
adminRouter.patch(
  "/reports/:reportId/resolve",
  asyncHandler(requireAuth),
  requireRole("ADMIN"),
  validateRequest(resolveReportSchema),
  asyncHandler(resolveModerationReport)
);
adminRouter.patch(
  "/users/:userId/status",
  asyncHandler(requireAuth),
  requireRole("ADMIN"),
  validateRequest(updateUserStatusSchema),
  asyncHandler(patchUserStatus)
);
adminRouter.patch(
  "/coaches/:userId/validate",
  asyncHandler(requireAuth),
  requireRole("ADMIN"),
  validateRequest(coachValidationSchema),
  asyncHandler(approveCoach)
);
adminRouter.delete(
  "/posts/:postId",
  asyncHandler(requireAuth),
  requireRole("ADMIN"),
  validateRequest(postModerationSchema),
  asyncHandler(removePostAsAdmin)
);
adminRouter.delete(
  "/comments/:commentId",
  asyncHandler(requireAuth),
  requireRole("ADMIN"),
  validateRequest(commentModerationSchema),
  asyncHandler(removeCommentAsAdmin)
);

export default adminRouter;

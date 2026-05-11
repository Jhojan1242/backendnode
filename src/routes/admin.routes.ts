import { Router } from "express";

import {
  approveCoach,
  createModerationReport,
  getAdminSections,
  getAdminUsers,
  getReports,
  patchAdminSection,
  patchUserStatus,
  removeCommentAsAdmin,
  removePostAsAdmin,
  resolveModerationReport
} from "@/controllers/admin.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { mutationRateLimit } from "@/middlewares/security-policies.middleware";
import { validateRequest } from "@/middlewares/validate-request.middleware";
import {
  adminSectionParamsSchema,
  coachValidationSchema,
  commentModerationSchema,
  createReportSchema,
  listAdminUsersQuerySchema,
  postModerationSchema,
  resolveReportSchema,
  updateSectionSchema,
  updateUserStatusSchema
} from "@/schemas/admin.schema";
import { asyncHandler } from "@/utils/async-handler";

const adminRouter = Router();

adminRouter.post(
  "/reports",
  mutationRateLimit,
  asyncHandler(requireAuth),
  validateRequest(createReportSchema),
  asyncHandler(createModerationReport)
);
adminRouter.get("/reports", asyncHandler(requireAuth), requireRole("ADMIN"), asyncHandler(getReports));
adminRouter.get(
  "/users",
  asyncHandler(requireAuth),
  requireRole("ADMIN"),
  validateRequest(listAdminUsersQuerySchema),
  asyncHandler(getAdminUsers)
);
adminRouter.get("/sections", asyncHandler(requireAuth), requireRole("ADMIN"), asyncHandler(getAdminSections));
adminRouter.patch(
  "/sections/:sectionId",
  mutationRateLimit,
  asyncHandler(requireAuth),
  requireRole("ADMIN"),
  validateRequest(updateSectionSchema),
  asyncHandler(patchAdminSection)
);
adminRouter.patch(
  "/reports/:reportId/resolve",
  mutationRateLimit,
  asyncHandler(requireAuth),
  requireRole("ADMIN"),
  validateRequest(resolveReportSchema),
  asyncHandler(resolveModerationReport)
);
adminRouter.patch(
  "/users/:userId/status",
  mutationRateLimit,
  asyncHandler(requireAuth),
  requireRole("ADMIN"),
  validateRequest(updateUserStatusSchema),
  asyncHandler(patchUserStatus)
);
adminRouter.patch(
  "/coaches/:userId/validate",
  mutationRateLimit,
  asyncHandler(requireAuth),
  requireRole("ADMIN"),
  validateRequest(coachValidationSchema),
  asyncHandler(approveCoach)
);
adminRouter.delete(
  "/posts/:postId",
  mutationRateLimit,
  asyncHandler(requireAuth),
  requireRole("ADMIN"),
  validateRequest(postModerationSchema),
  asyncHandler(removePostAsAdmin)
);
adminRouter.delete(
  "/comments/:commentId",
  mutationRateLimit,
  asyncHandler(requireAuth),
  requireRole("ADMIN"),
  validateRequest(commentModerationSchema),
  asyncHandler(removeCommentAsAdmin)
);

export default adminRouter;

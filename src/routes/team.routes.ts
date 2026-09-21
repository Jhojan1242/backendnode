import { Router } from "express";

import {
  blockRunnerFromTeam,
  assignPlanToRunner,
  createCoachContent,
  createCoachTeam,
  createJoinRequest,
  getCoachContents,
  getJoinRequests,
  getTeam,
  getTeams,
  removeRunnerFromTeam,
  reviewRequest
} from "@/controllers/team.controller";
import { attachOptionalAuth, requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { mutationRateLimit } from "@/middlewares/security-policies.middleware";
import { validateRequest } from "@/middlewares/validate-request.middleware";
import {
  blockTeamMemberSchema,
  assignTrainingPlanSchema,
  createCoachContentSchema,
  createJoinRequestSchema,
  createTeamSchema,
  listCoachContentsQuerySchema,
  listJoinRequestsQuerySchema,
  listTeamsQuerySchema,
  reviewJoinRequestSchema,
  teamIdParamSchema,
  teamMemberParamsSchema
} from "@/schemas/team.schema";
import { asyncHandler } from "@/utils/async-handler";

const teamRouter = Router();

teamRouter.get("/", asyncHandler(attachOptionalAuth), validateRequest(listTeamsQuerySchema), asyncHandler(getTeams));
teamRouter.get("/:teamId", asyncHandler(attachOptionalAuth), validateRequest(teamIdParamSchema), asyncHandler(getTeam));
teamRouter.post(
  "/",
  mutationRateLimit,
  asyncHandler(requireAuth),
  requireRole("COACH", "ADMIN"),
  validateRequest(createTeamSchema),
  asyncHandler(createCoachTeam)
);
teamRouter.post(
  "/:teamId/join-requests",
  mutationRateLimit,
  asyncHandler(requireAuth),
  validateRequest(createJoinRequestSchema),
  asyncHandler(createJoinRequest)
);
teamRouter.get(
  "/:teamId/join-requests",
  asyncHandler(requireAuth),
  validateRequest(listJoinRequestsQuerySchema),
  asyncHandler(getJoinRequests)
);
teamRouter.patch(
  "/join-requests/:requestId",
  mutationRateLimit,
  asyncHandler(requireAuth),
  validateRequest(reviewJoinRequestSchema),
  asyncHandler(reviewRequest)
);
teamRouter.delete(
  "/:teamId/members/:memberId",
  mutationRateLimit,
  asyncHandler(requireAuth),
  requireRole("COACH", "ADMIN"),
  validateRequest(teamMemberParamsSchema),
  asyncHandler(removeRunnerFromTeam)
);
teamRouter.post(
  "/:teamId/blocks",
  mutationRateLimit,
  asyncHandler(requireAuth),
  requireRole("COACH", "ADMIN"),
  validateRequest(blockTeamMemberSchema),
  asyncHandler(blockRunnerFromTeam)
);
teamRouter.post(
  "/content",
  mutationRateLimit,
  asyncHandler(requireAuth),
  requireRole("COACH", "ADMIN"),
  validateRequest(createCoachContentSchema),
  asyncHandler(createCoachContent)
);
teamRouter.post(
  "/:teamId/plan-assignments",
  mutationRateLimit,
  asyncHandler(requireAuth),
  requireRole("COACH", "ADMIN"),
  validateRequest(assignTrainingPlanSchema),
  asyncHandler(assignPlanToRunner)
);
teamRouter.get("/content/all", validateRequest(listCoachContentsQuerySchema), asyncHandler(getCoachContents));

export default teamRouter;

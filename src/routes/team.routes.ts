import { Router } from "express";

import {
  createCoachContent,
  createCoachTeam,
  createJoinRequest,
  getCoachContents,
  getJoinRequests,
  getTeam,
  getTeams,
  reviewRequest
} from "@/controllers/team.controller";
import { requireAuth, requireRole } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validate-request.middleware";
import {
  createCoachContentSchema,
  createJoinRequestSchema,
  createTeamSchema,
  listCoachContentsQuerySchema,
  listJoinRequestsQuerySchema,
  listTeamsQuerySchema,
  reviewJoinRequestSchema,
  teamIdParamSchema
} from "@/schemas/team.schema";
import { asyncHandler } from "@/utils/async-handler";

const teamRouter = Router();

teamRouter.get("/", validateRequest(listTeamsQuerySchema), asyncHandler(getTeams));
teamRouter.get("/:teamId", validateRequest(teamIdParamSchema), asyncHandler(getTeam));
teamRouter.post(
  "/",
  asyncHandler(requireAuth),
  requireRole("COACH", "ADMIN"),
  validateRequest(createTeamSchema),
  asyncHandler(createCoachTeam)
);
teamRouter.post(
  "/:teamId/join-requests",
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
  asyncHandler(requireAuth),
  validateRequest(reviewJoinRequestSchema),
  asyncHandler(reviewRequest)
);
teamRouter.post(
  "/content",
  asyncHandler(requireAuth),
  requireRole("COACH", "ADMIN"),
  validateRequest(createCoachContentSchema),
  asyncHandler(createCoachContent)
);
teamRouter.get("/content/all", validateRequest(listCoachContentsQuerySchema), asyncHandler(getCoachContents));

export default teamRouter;

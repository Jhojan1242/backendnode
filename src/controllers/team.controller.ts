import { Request, Response } from "express";

import {
  blockTeamMember,
  createTeam,
  getTeamById,
  listCoachContents,
  listTeamJoinRequests,
  listTeams,
  publishCoachContent,
  removeTeamMember,
  requestToJoinTeam,
  reviewJoinRequest
} from "@/services/team.service";
import { getParamValue, requireAuthenticatedUser } from "@/utils/request";
import { sendSuccessResponse } from "@/utils/send-response";

export async function createCoachTeam(req: Request, res: Response) {
  const team = await createTeam(requireAuthenticatedUser(req).id, req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: "Team created successfully",
    data: team
  });
}

export async function getTeams(req: Request, res: Response) {
  const teams = await listTeams(req.query as never, req.user?.id);

  return sendSuccessResponse(res, {
    message: "Teams fetched successfully",
    data: teams
  });
}

export async function getTeam(req: Request, res: Response) {
  const team = await getTeamById(getParamValue(req.params.teamId, "Team id"), req.user?.id);

  return sendSuccessResponse(res, {
    message: "Team fetched successfully",
    data: team
  });
}

export async function createJoinRequest(req: Request, res: Response) {
  const request = await requestToJoinTeam(
    requireAuthenticatedUser(req).id,
    getParamValue(req.params.teamId, "Team id"),
    req.body
  );

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: "Join request submitted successfully",
    data: request
  });
}

export async function getJoinRequests(req: Request, res: Response) {
  const requests = await listTeamJoinRequests(
    requireAuthenticatedUser(req).id,
    getParamValue(req.params.teamId, "Team id"),
    req.query as never
  );

  return sendSuccessResponse(res, {
    message: "Join requests fetched successfully",
    data: requests
  });
}

export async function reviewRequest(req: Request, res: Response) {
  const request = await reviewJoinRequest(
    requireAuthenticatedUser(req).id,
    getParamValue(req.params.requestId, "Request id"),
    req.body
  );

  return sendSuccessResponse(res, {
    message: "Join request reviewed successfully",
    data: request
  });
}

export async function createCoachContent(req: Request, res: Response) {
  const content = await publishCoachContent(requireAuthenticatedUser(req).id, req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: "Coach content published successfully",
    data: content
  });
}

export async function getCoachContents(req: Request, res: Response) {
  const contents = await listCoachContents(req.query as never);

  return sendSuccessResponse(res, {
    message: "Coach content fetched successfully",
    data: contents
  });
}

export async function removeRunnerFromTeam(req: Request, res: Response) {
  const result = await removeTeamMember(
    requireAuthenticatedUser(req).id,
    getParamValue(req.params.teamId, "Team id"),
    getParamValue(req.params.memberId, "Member id")
  );

  return sendSuccessResponse(res, {
    message: "Team member removed successfully",
    data: result
  });
}

export async function blockRunnerFromTeam(req: Request, res: Response) {
  const result = await blockTeamMember(
    requireAuthenticatedUser(req).id,
    getParamValue(req.params.teamId, "Team id"),
    req.body
  );

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: "Runner blocked from team successfully",
    data: result
  });
}

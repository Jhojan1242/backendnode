import { Request, Response } from "express";

import { AppError } from "@/errors/app-error";
import {
  createTeam,
  getTeamById,
  listCoachContents,
  listTeamJoinRequests,
  listTeams,
  publishCoachContent,
  requestToJoinTeam,
  reviewJoinRequest
} from "@/services/team.service";
import { sendSuccessResponse } from "@/utils/send-response";

function getRequestUserId(req: Request) {
  if (!req.user) {
    throw new AppError("Authentication is required", 401);
  }

  return req.user.id;
}

function getParamValue(value: string | string[], label: string) {
  if (Array.isArray(value)) {
    throw new AppError(`${label} is invalid`, 400);
  }

  return value;
}

export async function createCoachTeam(req: Request, res: Response) {
  const team = await createTeam(getRequestUserId(req), req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: "Team created successfully",
    data: team
  });
}

export async function getTeams(req: Request, res: Response) {
  const teams = await listTeams(req.query as never);

  return sendSuccessResponse(res, {
    message: "Teams fetched successfully",
    data: teams
  });
}

export async function getTeam(req: Request, res: Response) {
  const team = await getTeamById(getParamValue(req.params.teamId, "Team id"));

  return sendSuccessResponse(res, {
    message: "Team fetched successfully",
    data: team
  });
}

export async function createJoinRequest(req: Request, res: Response) {
  const request = await requestToJoinTeam(
    getRequestUserId(req),
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
    getRequestUserId(req),
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
    getRequestUserId(req),
    getParamValue(req.params.requestId, "Request id"),
    req.body
  );

  return sendSuccessResponse(res, {
    message: "Join request reviewed successfully",
    data: request
  });
}

export async function createCoachContent(req: Request, res: Response) {
  const content = await publishCoachContent(getRequestUserId(req), req.body);

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

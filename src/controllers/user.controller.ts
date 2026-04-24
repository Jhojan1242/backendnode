import { Request, Response } from "express";

import { AppError } from "@/errors/app-error";
import {
  createGoal,
  discoverNearbyUsers,
  followUser,
  getMyProfile,
  getPublicUserProfile,
  listFollowers,
  listFollowing,
  listMyGoals,
  unfollowUser,
  updateGoalProgress,
  updateMyProfile
} from "@/services/user.service";
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

export async function getMeProfile(req: Request, res: Response) {
  const profile = await getMyProfile(getRequestUserId(req));

  return sendSuccessResponse(res, {
    message: "Profile fetched successfully",
    data: profile
  });
}

export async function getUserProfile(req: Request, res: Response) {
  const profile = await getPublicUserProfile(getParamValue(req.params.userId, "User id"));

  return sendSuccessResponse(res, {
    message: "Public profile fetched successfully",
    data: profile
  });
}

export async function patchMyProfile(req: Request, res: Response) {
  const profile = await updateMyProfile(getRequestUserId(req), req.body);

  return sendSuccessResponse(res, {
    message: "Profile updated successfully",
    data: profile
  });
}

export async function getNearbyUsers(req: Request, res: Response) {
  const users = await discoverNearbyUsers(getRequestUserId(req), req.query as never);

  return sendSuccessResponse(res, {
    message: "Nearby users fetched successfully",
    data: users
  });
}

export async function followRunner(req: Request, res: Response) {
  const result = await followUser(getRequestUserId(req), getParamValue(req.params.userId, "User id"));

  return sendSuccessResponse(res, {
    message: "User followed successfully",
    data: result
  });
}

export async function unfollowRunner(req: Request, res: Response) {
  const result = await unfollowUser(getRequestUserId(req), getParamValue(req.params.userId, "User id"));

  return sendSuccessResponse(res, {
    message: "User unfollowed successfully",
    data: result
  });
}

export async function getFollowers(req: Request, res: Response) {
  const data = await listFollowers(getParamValue(req.params.userId, "User id"), req.query as never);

  return sendSuccessResponse(res, {
    message: "Followers fetched successfully",
    data
  });
}

export async function getFollowing(req: Request, res: Response) {
  const data = await listFollowing(getParamValue(req.params.userId, "User id"), req.query as never);

  return sendSuccessResponse(res, {
    message: "Following fetched successfully",
    data
  });
}

export async function createUserGoal(req: Request, res: Response) {
  const goal = await createGoal(getRequestUserId(req), req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: "Goal created successfully",
    data: goal
  });
}

export async function getMyGoals(req: Request, res: Response) {
  const goals = await listMyGoals(getRequestUserId(req), req.query as never);

  return sendSuccessResponse(res, {
    message: "Goals fetched successfully",
    data: goals
  });
}

export async function patchGoalProgress(req: Request, res: Response) {
  const goal = await updateGoalProgress(
    getRequestUserId(req),
    getParamValue(req.params.goalId, "Goal id"),
    req.body
  );

  return sendSuccessResponse(res, {
    message: "Goal progress updated successfully",
    data: goal
  });
}

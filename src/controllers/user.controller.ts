import { Request, Response } from "express";

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
import { getParamValue, requireAuthenticatedUser } from "@/utils/request";
import { sendSuccessResponse } from "@/utils/send-response";

export async function getMeProfile(req: Request, res: Response) {
  const profile = await getMyProfile(requireAuthenticatedUser(req).id);

  return sendSuccessResponse(res, {
    message: "Profile fetched successfully",
    data: profile
  });
}

export async function getUserProfile(req: Request, res: Response) {
  const profile = await getPublicUserProfile(getParamValue(req.params.userId, "User id"), req.user?.id);

  return sendSuccessResponse(res, {
    message: "Public profile fetched successfully",
    data: profile
  });
}

export async function patchMyProfile(req: Request, res: Response) {
  const profile = await updateMyProfile(requireAuthenticatedUser(req).id, req.body);

  return sendSuccessResponse(res, {
    message: "Profile updated successfully",
    data: profile
  });
}

export async function getNearbyUsers(req: Request, res: Response) {
  const users = await discoverNearbyUsers(requireAuthenticatedUser(req).id, req.query as never);

  return sendSuccessResponse(res, {
    message: "Nearby users fetched successfully",
    data: users
  });
}

export async function followRunner(req: Request, res: Response) {
  const result = await followUser(requireAuthenticatedUser(req).id, getParamValue(req.params.userId, "User id"));

  return sendSuccessResponse(res, {
    message: "User followed successfully",
    data: result
  });
}

export async function unfollowRunner(req: Request, res: Response) {
  const result = await unfollowUser(
    requireAuthenticatedUser(req).id,
    getParamValue(req.params.userId, "User id")
  );

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
  const goal = await createGoal(requireAuthenticatedUser(req).id, req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: "Goal created successfully",
    data: goal
  });
}

export async function getMyGoals(req: Request, res: Response) {
  const goals = await listMyGoals(requireAuthenticatedUser(req).id, req.query as never);

  return sendSuccessResponse(res, {
    message: "Goals fetched successfully",
    data: goals
  });
}

export async function patchGoalProgress(req: Request, res: Response) {
  const goal = await updateGoalProgress(
    requireAuthenticatedUser(req).id,
    getParamValue(req.params.goalId, "Goal id"),
    req.body
  );

  return sendSuccessResponse(res, {
    message: "Goal progress updated successfully",
    data: goal
  });
}

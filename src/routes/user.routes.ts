import { Router } from "express";

import {
  createUserGoal,
  followRunner,
  getFollowers,
  getFollowing,
  getMeProfile,
  getMyGoals,
  getNearbyUsers,
  getUserProfile,
  patchGoalProgress,
  patchMyProfile,
  unfollowRunner
} from "@/controllers/user.controller";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validate-request.middleware";
import {
  createGoalSchema,
  discoverUsersSchema,
  followListQuerySchema,
  goalListQuerySchema,
  updateGoalProgressSchema,
  updateProfileSchema,
  userIdParamSchema
} from "@/schemas/user.schema";
import { asyncHandler } from "@/utils/async-handler";

const userRouter = Router();

userRouter.get("/me", asyncHandler(requireAuth), asyncHandler(getMeProfile));
userRouter.patch(
  "/me/profile",
  asyncHandler(requireAuth),
  validateRequest(updateProfileSchema),
  asyncHandler(patchMyProfile)
);
userRouter.get(
  "/discover/nearby",
  asyncHandler(requireAuth),
  validateRequest(discoverUsersSchema),
  asyncHandler(getNearbyUsers)
);
userRouter.get("/:userId", validateRequest(userIdParamSchema), asyncHandler(getUserProfile));
userRouter.post(
  "/:userId/follow",
  asyncHandler(requireAuth),
  validateRequest(userIdParamSchema),
  asyncHandler(followRunner)
);
userRouter.delete(
  "/:userId/follow",
  asyncHandler(requireAuth),
  validateRequest(userIdParamSchema),
  asyncHandler(unfollowRunner)
);
userRouter.get("/:userId/followers", validateRequest(followListQuerySchema), asyncHandler(getFollowers));
userRouter.get("/:userId/following", validateRequest(followListQuerySchema), asyncHandler(getFollowing));
userRouter.post(
  "/goals",
  asyncHandler(requireAuth),
  validateRequest(createGoalSchema),
  asyncHandler(createUserGoal)
);
userRouter.get("/goals/me", asyncHandler(requireAuth), validateRequest(goalListQuerySchema), asyncHandler(getMyGoals));
userRouter.patch(
  "/goals/:goalId/progress",
  asyncHandler(requireAuth),
  validateRequest(updateGoalProgressSchema),
  asyncHandler(patchGoalProgress)
);

export default userRouter;

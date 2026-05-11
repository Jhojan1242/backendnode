import { Router } from "express";

import {
  createPostComment,
  createRunnerPost,
  getFeed,
  getPost,
  getPostComments,
  getPosts,
  likeRunnerPost,
  patchPost,
  removePost,
  unlikeRunnerPost
} from "@/controllers/post.controller";
import { requireAuth } from "@/middlewares/auth.middleware";
import { validateRequest } from "@/middlewares/validate-request.middleware";
import {
  createCommentSchema,
  createPostSchema,
  feedQuerySchema,
  listPostsQuerySchema,
  postCommentsQuerySchema,
  postIdParamSchema,
  updatePostSchema
} from "@/schemas/post.schema";
import { mutationRateLimit } from "@/middlewares/security-policies.middleware";
import { asyncHandler } from "@/utils/async-handler";

const postRouter = Router();

postRouter.get("/", validateRequest(listPostsQuerySchema), asyncHandler(getPosts));
postRouter.get("/feed", asyncHandler(requireAuth), validateRequest(feedQuerySchema), asyncHandler(getFeed));
postRouter.post("/", mutationRateLimit, asyncHandler(requireAuth), validateRequest(createPostSchema), asyncHandler(createRunnerPost));
postRouter.get("/:postId", validateRequest(postIdParamSchema), asyncHandler(getPost));
postRouter.patch(
  "/:postId",
  mutationRateLimit,
  asyncHandler(requireAuth),
  validateRequest(updatePostSchema),
  asyncHandler(patchPost)
);
postRouter.delete(
  "/:postId",
  mutationRateLimit,
  asyncHandler(requireAuth),
  validateRequest(postIdParamSchema),
  asyncHandler(removePost)
);
postRouter.post(
  "/:postId/like",
  mutationRateLimit,
  asyncHandler(requireAuth),
  validateRequest(postIdParamSchema),
  asyncHandler(likeRunnerPost)
);
postRouter.delete(
  "/:postId/like",
  mutationRateLimit,
  asyncHandler(requireAuth),
  validateRequest(postIdParamSchema),
  asyncHandler(unlikeRunnerPost)
);
postRouter.post(
  "/:postId/comments",
  mutationRateLimit,
  asyncHandler(requireAuth),
  validateRequest(createCommentSchema),
  asyncHandler(createPostComment)
);
postRouter.get(
  "/:postId/comments",
  validateRequest(postCommentsQuerySchema),
  asyncHandler(getPostComments)
);

export default postRouter;

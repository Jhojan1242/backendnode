import { Request, Response } from "express";

import {
  addComment,
  createPost,
  deletePost,
  getPostById,
  likePost,
  listAllPosts,
  listComments,
  listFeed,
  unlikePost,
  updatePost
} from "@/services/post.service";
import { getParamValue, requireAuthenticatedUser } from "@/utils/request";
import { sendSuccessResponse } from "@/utils/send-response";

export async function createRunnerPost(req: Request, res: Response) {
  const post = await createPost(requireAuthenticatedUser(req).id, req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: "Post created successfully",
    data: post
  });
}

export async function getFeed(req: Request, res: Response) {
  const posts = await listFeed(requireAuthenticatedUser(req).id, req.query as never);

  return sendSuccessResponse(res, {
    message: "Feed fetched successfully",
    data: posts
  });
}

export async function getPosts(req: Request, res: Response) {
  const posts = await listAllPosts(req.query as never);

  return sendSuccessResponse(res, {
    message: "Posts fetched successfully",
    data: posts
  });
}

export async function getPost(req: Request, res: Response) {
  const post = await getPostById(getParamValue(req.params.postId, "Post id"));

  return sendSuccessResponse(res, {
    message: "Post fetched successfully",
    data: post
  });
}

export async function patchPost(req: Request, res: Response) {
  const post = await updatePost(
    requireAuthenticatedUser(req).id,
    getParamValue(req.params.postId, "Post id"),
    req.body
  );

  return sendSuccessResponse(res, {
    message: "Post updated successfully",
    data: post
  });
}

export async function removePost(req: Request, res: Response) {
  const result = await deletePost(requireAuthenticatedUser(req).id, getParamValue(req.params.postId, "Post id"));

  return sendSuccessResponse(res, {
    message: "Post deleted successfully",
    data: result
  });
}

export async function likeRunnerPost(req: Request, res: Response) {
  const result = await likePost(requireAuthenticatedUser(req).id, getParamValue(req.params.postId, "Post id"));

  return sendSuccessResponse(res, {
    message: "Post liked successfully",
    data: result
  });
}

export async function unlikeRunnerPost(req: Request, res: Response) {
  const result = await unlikePost(requireAuthenticatedUser(req).id, getParamValue(req.params.postId, "Post id"));

  return sendSuccessResponse(res, {
    message: "Post unliked successfully",
    data: result
  });
}

export async function createPostComment(req: Request, res: Response) {
  const comment = await addComment(
    requireAuthenticatedUser(req).id,
    getParamValue(req.params.postId, "Post id"),
    req.body
  );

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: "Comment created successfully",
    data: comment
  });
}

export async function getPostComments(req: Request, res: Response) {
  const comments = await listComments(getParamValue(req.params.postId, "Post id"), req.query as never);

  return sendSuccessResponse(res, {
    message: "Comments fetched successfully",
    data: comments
  });
}

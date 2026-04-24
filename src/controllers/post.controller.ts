import { Request, Response } from "express";

import { AppError } from "@/errors/app-error";
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

export async function createRunnerPost(req: Request, res: Response) {
  const post = await createPost(getRequestUserId(req), req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: "Post created successfully",
    data: post
  });
}

export async function getFeed(req: Request, res: Response) {
  const posts = await listFeed(getRequestUserId(req), req.query as never);

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
  const post = await updatePost(getRequestUserId(req), getParamValue(req.params.postId, "Post id"), req.body);

  return sendSuccessResponse(res, {
    message: "Post updated successfully",
    data: post
  });
}

export async function removePost(req: Request, res: Response) {
  const result = await deletePost(getRequestUserId(req), getParamValue(req.params.postId, "Post id"));

  return sendSuccessResponse(res, {
    message: "Post deleted successfully",
    data: result
  });
}

export async function likeRunnerPost(req: Request, res: Response) {
  const result = await likePost(getRequestUserId(req), getParamValue(req.params.postId, "Post id"));

  return sendSuccessResponse(res, {
    message: "Post liked successfully",
    data: result
  });
}

export async function unlikeRunnerPost(req: Request, res: Response) {
  const result = await unlikePost(getRequestUserId(req), getParamValue(req.params.postId, "Post id"));

  return sendSuccessResponse(res, {
    message: "Post unliked successfully",
    data: result
  });
}

export async function createPostComment(req: Request, res: Response) {
  const comment = await addComment(getRequestUserId(req), getParamValue(req.params.postId, "Post id"), req.body);

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

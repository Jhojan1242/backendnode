import { Request, Response } from "express";

import { AppError } from "@/errors/app-error";
import {
  createReport,
  deleteCommentAsAdmin,
  deletePostAsAdmin,
  listReports,
  resolveReport,
  updateUserStatus,
  validateCoach
} from "@/services/admin.service";
import { sendSuccessResponse } from "@/utils/send-response";

function getParamValue(value: string | string[], label: string) {
  if (Array.isArray(value)) {
    throw new AppError(`${label} is invalid`, 400);
  }

  return value;
}

export async function createModerationReport(req: Request, res: Response) {
  const report = await createReport(req.user!.id, req.body);

  return sendSuccessResponse(res, {
    statusCode: 201,
    message: "Report created successfully",
    data: report
  });
}

export async function getReports(_req: Request, res: Response) {
  const reports = await listReports();

  return sendSuccessResponse(res, {
    message: "Reports fetched successfully",
    data: reports
  });
}

export async function resolveModerationReport(req: Request, res: Response) {
  const report = await resolveReport(req.user!.id, getParamValue(req.params.reportId, "Report id"), req.body);

  return sendSuccessResponse(res, {
    message: "Report resolved successfully",
    data: report
  });
}

export async function patchUserStatus(req: Request, res: Response) {
  const user = await updateUserStatus(getParamValue(req.params.userId, "User id"), req.body.isActive);

  return sendSuccessResponse(res, {
    message: "User status updated successfully",
    data: user
  });
}

export async function approveCoach(req: Request, res: Response) {
  const user = await validateCoach(getParamValue(req.params.userId, "User id"));

  return sendSuccessResponse(res, {
    message: "Coach validated successfully",
    data: user
  });
}

export async function removePostAsAdmin(req: Request, res: Response) {
  const post = await deletePostAsAdmin(getParamValue(req.params.postId, "Post id"));

  return sendSuccessResponse(res, {
    message: "Post deleted successfully",
    data: post
  });
}

export async function removeCommentAsAdmin(req: Request, res: Response) {
  const comment = await deleteCommentAsAdmin(getParamValue(req.params.commentId, "Comment id"));

  return sendSuccessResponse(res, {
    message: "Comment deleted successfully",
    data: comment
  });
}

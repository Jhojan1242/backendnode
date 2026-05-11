import { Request, Response } from "express";

import {
  createReport,
  deleteCommentAsAdmin,
  deletePostAsAdmin,
  listAdminUsers,
  listAppSections,
  listReports,
  resolveReport,
  updateAppSection,
  updateUserStatus,
  validateCoach
} from "@/services/admin.service";
import { getParamValue, requireAuthenticatedUser } from "@/utils/request";
import { sendSuccessResponse } from "@/utils/send-response";

export async function createModerationReport(req: Request, res: Response) {
  const report = await createReport(requireAuthenticatedUser(req).id, req.body);

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

export async function getAdminUsers(req: Request, res: Response) {
  const users = await listAdminUsers(req.query as never);

  return sendSuccessResponse(res, {
    message: "Users fetched successfully",
    data: users
  });
}

export async function getAdminSections(_req: Request, res: Response) {
  const sections = await listAppSections();

  return sendSuccessResponse(res, {
    message: "Sections fetched successfully",
    data: sections
  });
}

export async function patchAdminSection(req: Request, res: Response) {
  const section = await updateAppSection(getParamValue(req.params.sectionId, "Section id"), req.body.enabled);

  return sendSuccessResponse(res, {
    message: "Section updated successfully",
    data: section
  });
}

export async function resolveModerationReport(req: Request, res: Response) {
  const report = await resolveReport(
    requireAuthenticatedUser(req).id,
    getParamValue(req.params.reportId, "Report id"),
    req.body
  );

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

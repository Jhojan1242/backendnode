import { Request, Response } from "express";

import { AppError } from "@/errors/app-error";
import { listNotifications, markNotificationAsRead } from "@/services/notification.service";
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

export async function getMyNotifications(req: Request, res: Response) {
  const notifications = await listNotifications(getRequestUserId(req), req.query as never);

  return sendSuccessResponse(res, {
    message: "Notifications fetched successfully",
    data: notifications
  });
}

export async function readNotification(req: Request, res: Response) {
  const notification = await markNotificationAsRead(
    getRequestUserId(req),
    getParamValue(req.params.notificationId, "Notification id")
  );

  return sendSuccessResponse(res, {
    message: "Notification marked as read",
    data: notification
  });
}

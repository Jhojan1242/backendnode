import { Request, Response } from "express";

import { listNotifications, markNotificationAsRead } from "@/services/notification.service";
import { getParamValue, requireAuthenticatedUser } from "@/utils/request";
import { sendSuccessResponse } from "@/utils/send-response";

export async function getMyNotifications(req: Request, res: Response) {
  const notifications = await listNotifications(requireAuthenticatedUser(req).id, req.query as never);

  return sendSuccessResponse(res, {
    message: "Notifications fetched successfully",
    data: notifications
  });
}

export async function readNotification(req: Request, res: Response) {
  const notification = await markNotificationAsRead(
    requireAuthenticatedUser(req).id,
    getParamValue(req.params.notificationId, "Notification id")
  );

  return sendSuccessResponse(res, {
    message: "Notification marked as read",
    data: notification
  });
}

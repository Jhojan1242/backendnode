import prisma from "@/configs/prisma";
import { createPaginatedResponse, getPagination } from "@/utils/pagination";

type CreateNotificationInput = {
  recipientId: string;
  actorId?: string;
  message: string;
  type:
    | "FOLLOW"
    | "POST_LIKE"
    | "POST_COMMENT"
    | "TEAM_JOIN_REQUEST"
    | "TEAM_REQUEST_APPROVED"
    | "TEAM_REQUEST_REJECTED"
    | "GOAL_COMPLETED"
    | "COACH_CONTENT_PUBLISHED";
};

export async function createNotification(input: CreateNotificationInput) {
  if (input.actorId && input.actorId === input.recipientId) {
    return null;
  }

  return prisma.notification.create({
    data: input
  });
}

type ListNotificationsInput = {
  page: number;
  limit: number;
  isRead?: boolean;
};

export async function listNotifications(userId: string, input: ListNotificationsInput) {
  const where = {
    recipientId: userId,
    ...(input.isRead !== undefined ? { isRead: input.isRead } : {})
  };
  const totalItems = await prisma.notification.count({ where });
  const { skip, take } = getPagination(input);

  const notifications = await prisma.notification.findMany({
    where: {
      ...where
    },
    orderBy: {
      createdAt: "desc"
    },
    skip,
    take
  });

  return createPaginatedResponse(notifications, input, totalItems, {
    isRead: input.isRead
  });
}

export async function markNotificationAsRead(userId: string, notificationId: string) {
  return prisma.notification.update({
    where: {
      id: notificationId,
      recipientId: userId
    },
    data: {
      isRead: true
    }
  });
}

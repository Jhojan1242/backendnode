import { z } from "zod";

import { paginationQuerySchema } from "@/schemas/common.schema";

export const notificationIdParamSchema = z.object({
  params: z.object({
    notificationId: z.string().cuid()
  })
});

export const listNotificationsQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    isRead: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional()
  })
});

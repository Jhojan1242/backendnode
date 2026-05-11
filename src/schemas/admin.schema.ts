import { z } from "zod";

import { paginationQuerySchema } from "@/schemas/common.schema";

const adminSectionIds = [
  "feed",
  "posts",
  "comments",
  "likes",
  "follows",
  "teams",
  "coach_validation",
  "training_plans",
  "training_tips",
  "goals",
  "location_discovery",
  "notifications",
  "reports",
  "user_management",
  "content_moderation",
  "admin_panel"
] as const;

export const createReportSchema = z.object({
  body: z
    .object({
      reason: z.enum(["SPAM", "ABUSE", "HARASSMENT", "MISINFORMATION", "OTHER"]),
      details: z.string().trim().max(500).optional(),
      postId: z.string().cuid().optional(),
      commentId: z.string().cuid().optional()
    })
    .refine((value) => Boolean(value.postId) !== Boolean(value.commentId), {
      message: "Provide either postId or commentId",
      path: ["postId"]
    })
});

export const resolveReportSchema = z.object({
  params: z.object({
    reportId: z.string().cuid()
  }),
  body: z.object({
    action: z.enum(["dismiss", "delete_post", "delete_comment"])
  })
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    userId: z.string().cuid()
  }),
  body: z.object({
    isActive: z.boolean()
  })
});

export const coachValidationSchema = z.object({
  params: z.object({
    userId: z.string().cuid()
  })
});

export const listAdminUsersQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    role: z.enum(["RUNNER", "COACH", "ADMIN"]).optional(),
    search: z.string().trim().min(1).optional(),
    isActive: z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional()
  })
});

export const adminSectionParamsSchema = z.object({
  params: z.object({
    sectionId: z.enum(adminSectionIds)
  })
});

export const updateSectionSchema = z.object({
  params: z.object({
    sectionId: z.enum(adminSectionIds)
  }),
  body: z.object({
    enabled: z.boolean()
  })
});

export const postModerationSchema = z.object({
  params: z.object({
    postId: z.string().cuid()
  })
});

export const commentModerationSchema = z.object({
  params: z.object({
    commentId: z.string().cuid()
  })
});

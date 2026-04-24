import { z } from "zod";

import { paginationQuerySchema, searchQuerySchema } from "@/schemas/common.schema";

export const createTeamSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(100),
    description: z.string().trim().min(10).max(500),
    city: z.string().trim().max(80).optional()
  })
});

export const listTeamsQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    city: z.string().trim().optional(),
    search: searchQuerySchema.shape.search,
    sortBy: z.enum(["createdAt", "name", "members"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc")
  })
});

export const teamIdParamSchema = z.object({
  params: z.object({
    teamId: z.string().cuid()
  })
});

export const createJoinRequestSchema = z.object({
  params: z.object({
    teamId: z.string().cuid()
  }),
  body: z.object({
    message: z.string().trim().max(250).optional()
  })
});

export const reviewJoinRequestSchema = z.object({
  params: z.object({
    requestId: z.string().cuid()
  }),
  body: z.object({
    status: z.enum(["APPROVED", "REJECTED"])
  })
});

export const createCoachContentSchema = z.object({
  body: z.object({
    type: z.enum(["PLAN", "TIP"]),
    title: z.string().trim().min(3).max(120),
    content: z.string().trim().min(10).max(5000),
    teamId: z.string().cuid().optional()
  })
});

export const listJoinRequestsQuerySchema = z.object({
  params: z.object({
    teamId: z.string().cuid()
  }),
  query: paginationQuerySchema.extend({
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional()
  })
});

export const listCoachContentsQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    teamId: z.string().cuid().optional(),
    type: z.enum(["PLAN", "TIP"]).optional(),
    search: searchQuerySchema.shape.search,
    order: z.enum(["asc", "desc"]).default("desc")
  })
});

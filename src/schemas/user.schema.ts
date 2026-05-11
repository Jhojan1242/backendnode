import { z } from "zod";

import { paginationQuerySchema, searchQuerySchema } from "@/schemas/common.schema";

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().min(2).max(50).optional(),
    bio: z.string().trim().max(280).nullable().optional(),
    avatarUrl: z.url().nullable().optional(),
    city: z.string().trim().max(80).nullable().optional(),
    country: z.string().trim().max(80).nullable().optional(),
    latitude: z.number().min(-90).max(90).nullable().optional(),
    longitude: z.number().min(-180).max(180).nullable().optional(),
    favoritePace: z.number().positive().nullable().optional()
  })
});

export const discoverUsersSchema = z.object({
  query: paginationQuerySchema.extend({
    city: z.string().trim().optional(),
    country: z.string().trim().optional(),
    role: z.enum(["RUNNER", "COACH"]).optional(),
    search: searchQuerySchema.shape.search,
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional(),
    radiusKm: z.coerce.number().positive().max(200).default(10),
    sortBy: z.enum(["createdAt", "username", "distance"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc")
  })
});

export const userIdParamSchema = z.object({
  params: z.object({
    userId: z.string().cuid()
  })
});

export const createGoalSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(100),
    description: z.string().trim().max(300).optional(),
    targetDistanceKm: z.number().positive(),
    deadline: z.iso.datetime().optional()
  })
});

export const followListQuerySchema = z.object({
  params: z.object({
    userId: z.string().cuid()
  }),
  query: paginationQuerySchema.extend({
    search: searchQuerySchema.shape.search
  })
});

export const goalListQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).optional(),
    order: z.enum(["asc", "desc"]).default("desc")
  })
});

export const updateGoalProgressSchema = z.object({
  params: z.object({
    goalId: z.string().cuid()
  }),
  body: z.object({
    currentDistanceKm: z.number().nonnegative()
  })
});

import { z } from "zod";

import { paginationQuerySchema, searchQuerySchema } from "@/schemas/common.schema";

export const postIdParamSchema = z.object({
  params: z.object({
    postId: z.string().cuid()
  })
});

export const listPostsQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    search: searchQuerySchema.shape.search,
    sortBy: z.enum(["createdAt", "likes", "comments"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    authorId: z.string().cuid().optional(),
    locationName: z.string().trim().optional()
  })
});

export const feedQuerySchema = z.object({
  query: paginationQuerySchema.extend({
    search: searchQuerySchema.shape.search,
    sortBy: z.enum(["createdAt", "likes"]).default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc")
  })
});

export const postCommentsQuerySchema = z.object({
  params: z.object({
    postId: z.string().cuid()
  }),
  query: paginationQuerySchema.extend({
    order: z.enum(["asc", "desc"]).default("asc")
  })
});

export const createPostSchema = z.object({
  body: z.object({
    caption: z.string().trim().min(3).max(500),
    imageUrl: z.url().optional(),
    distanceKm: z.number().positive().optional(),
    durationMinutes: z.number().int().positive().optional(),
    locationName: z.string().trim().max(120).optional()
  })
});

export const updatePostSchema = z.object({
  params: z.object({
    postId: z.string().cuid()
  }),
  body: z.object({
    caption: z.string().trim().min(3).max(500).optional(),
    imageUrl: z.url().optional(),
    distanceKm: z.number().positive().optional(),
    durationMinutes: z.number().int().positive().optional(),
    locationName: z.string().trim().max(120).optional()
  })
});

export const createCommentSchema = z.object({
  params: z.object({
    postId: z.string().cuid()
  }),
  body: z.object({
    content: z.string().trim().min(1).max(500)
  })
});

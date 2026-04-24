import prisma from "@/configs/prisma";
import { AppError } from "@/errors/app-error";
import { createNotification } from "@/services/notification.service";
import { createPaginatedResponse, getPagination } from "@/utils/pagination";

type CreatePostInput = {
  caption: string;
  imageUrl?: string;
  distanceKm?: number;
  durationMinutes?: number;
  locationName?: string;
};

type UpdatePostInput = Partial<CreatePostInput>;

type CreateCommentInput = {
  content: string;
};

type ListPostsInput = {
  page: number;
  limit: number;
  search?: string;
  sortBy: "createdAt" | "likes" | "comments";
  order: "asc" | "desc";
  authorId?: string;
  locationName?: string;
};

type ListFeedInput = {
  page: number;
  limit: number;
  search?: string;
  sortBy: "createdAt" | "likes";
  order: "asc" | "desc";
};

type ListCommentsInput = {
  page: number;
  limit: number;
  order: "asc" | "desc";
};

const postInclude = {
  author: {
    select: {
      id: true,
      username: true,
      role: true,
      profile: true
    }
  },
  _count: {
    select: {
      comments: true,
      likes: true
    }
  }
} as const;

export async function createPost(userId: string, input: CreatePostInput) {
  const post = await prisma.post.create({
    data: {
      ...input,
      authorId: userId
    },
    include: postInclude
  });

  if (input.distanceKm && input.distanceKm > 0) {
    await prisma.profile.updateMany({
      where: {
        userId
      },
      data: {
        totalDistanceKm: {
          increment: input.distanceKm
        }
      }
    });
  }

  return post;
}

export async function listFeed(userId: string, input: ListFeedInput) {
  const following = await prisma.follow.findMany({
    where: {
      followerId: userId
    },
    select: {
      followingId: true
    }
  });

  const where = {
    OR: [{ authorId: userId }, { authorId: { in: following.map((entry) => entry.followingId) } }],
    ...(input.search
      ? {
          caption: {
            contains: input.search,
            mode: "insensitive" as const
          }
        }
      : {})
  };
  const totalItems = await prisma.post.count({ where });
  const { skip, take } = getPagination(input);

  const posts = await prisma.post.findMany({
    where,
    include: {
      ...postInclude,
      likes: {
        where: {
          userId
        },
        select: {
          userId: true
        }
      }
    },
    orderBy:
      input.sortBy === "likes"
        ? {
            likes: {
              _count: input.order
            }
          }
        : {
            createdAt: input.order
          },
    skip,
    take
  });

  return createPaginatedResponse(posts, input, totalItems, {
    search: input.search,
    sortBy: input.sortBy,
    order: input.order
  });
}

export async function listAllPosts(input: ListPostsInput) {
  const where = {
    ...(input.search
      ? {
          caption: {
            contains: input.search,
            mode: "insensitive" as const
          }
        }
      : {}),
    ...(input.authorId ? { authorId: input.authorId } : {}),
    ...(input.locationName
      ? {
          locationName: {
            contains: input.locationName,
            mode: "insensitive" as const
          }
        }
      : {})
  };
  const totalItems = await prisma.post.count({ where });
  const { skip, take } = getPagination(input);

  const posts = await prisma.post.findMany({
    where,
    include: postInclude,
    orderBy:
      input.sortBy === "likes"
        ? {
            likes: {
              _count: input.order
            }
          }
        : input.sortBy === "comments"
          ? {
              comments: {
                _count: input.order
              }
            }
          : {
              createdAt: input.order
            },
    skip,
    take
  });

  return createPaginatedResponse(posts, input, totalItems, {
    search: input.search,
    sortBy: input.sortBy,
    order: input.order,
    authorId: input.authorId,
    locationName: input.locationName
  });
}

export async function getPostById(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      ...postInclude,
      comments: {
        include: {
          author: {
            select: {
              id: true,
              username: true,
              profile: true
            }
          }
        },
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  return post;
}

export async function updatePost(userId: string, postId: string, input: UpdatePostInput) {
  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.authorId !== userId) {
    throw new AppError("You can only update your own posts", 403);
  }

  return prisma.post.update({
    where: { id: postId },
    data: input,
    include: postInclude
  });
}

export async function deletePost(userId: string, postId: string) {
  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.authorId !== userId) {
    throw new AppError("You can only delete your own posts", 403);
  }

  await prisma.post.delete({
    where: { id: postId }
  });

  return { success: true };
}

export async function likePost(userId: string, postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      authorId: true
    }
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  await prisma.postLike.upsert({
    where: {
      userId_postId: {
        userId,
        postId
      }
    },
    update: {},
    create: {
      userId,
      postId
    }
  });

  await createNotification({
    recipientId: post.authorId,
    actorId: userId,
    message: "Someone liked your post",
    type: "POST_LIKE"
  });

  return { success: true };
}

export async function unlikePost(userId: string, postId: string) {
  await prisma.postLike.deleteMany({
    where: {
      userId,
      postId
    }
  });

  return { success: true };
}

export async function addComment(userId: string, postId: string, input: CreateCommentInput) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      authorId: true
    }
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId: userId,
      content: input.content
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          profile: true
        }
      }
    }
  });

  await createNotification({
    recipientId: post.authorId,
    actorId: userId,
    message: "Someone commented on your post",
    type: "POST_COMMENT"
  });

  return comment;
}

export async function listComments(postId: string, input: ListCommentsInput) {
  const where = {
    postId
  };
  const totalItems = await prisma.comment.count({ where });
  const { skip, take } = getPagination(input);

  const comments = await prisma.comment.findMany({
    where: {
      postId
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          profile: true
        }
      }
    },
    orderBy: {
      createdAt: input.order
    },
    skip,
    take
  });

  return createPaginatedResponse(comments, input, totalItems, {
    order: input.order
  });
}

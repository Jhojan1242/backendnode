import prisma from "@/configs/prisma";
import { AppError } from "@/errors/app-error";
import { createNotification } from "@/services/notification.service";
import { createPaginatedResponse, getPagination } from "@/utils/pagination";

type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  favoritePace?: number | null;
};

type CreateGoalInput = {
  title: string;
  description?: string;
  targetDistanceKm: number;
  deadline?: string;
};

type UpdateGoalProgressInput = {
  currentDistanceKm: number;
};

type DiscoverUsersInput = {
  page: number;
  limit: number;
  city?: string;
  country?: string;
  role?: "RUNNER" | "COACH";
  search?: string;
  sortBy: "createdAt" | "username";
  order: "asc" | "desc";
};

type FollowListInput = {
  page: number;
  limit: number;
  search?: string;
};

type GoalListInput = {
  page: number;
  limit: number;
  status?: "ACTIVE" | "COMPLETED" | "ARCHIVED";
  order: "asc" | "desc";
};

const publicUserSelect = {
  id: true,
  email: true,
  username: true,
  role: true,
  isCoachValidated: true,
  createdAt: true,
  profile: true,
  _count: {
    select: {
      posts: true,
      followers: true,
      following: true
    }
  }
} as const;

export async function getMyProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...publicUserSelect,
      isActive: true,
      goals: {
        orderBy: {
          createdAt: "desc"
        }
      },
      teamMemberships: {
        include: {
          team: true
        }
      }
    }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function getPublicUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function updateMyProfile(userId: string, input: UpdateProfileInput) {
  const existingProfile = await prisma.profile.findUnique({
    where: {
      userId
    }
  });

  if (!existingProfile) {
    throw new AppError("Profile not found", 404);
  }

  return prisma.profile.update({
    where: {
      userId
    },
    data: input
  });
}

export async function discoverNearbyUsers(userId: string, input: DiscoverUsersInput) {
  const where = {
    id: {
      not: userId
    },
    ...(input.role ? { role: input.role } : {}),
    ...(input.search
      ? {
          OR: [
            {
              username: {
                contains: input.search,
                mode: "insensitive" as const
              }
            },
            {
              profile: {
                firstName: {
                  contains: input.search,
                  mode: "insensitive" as const
                }
              }
            },
            {
              profile: {
                lastName: {
                  contains: input.search,
                  mode: "insensitive" as const
                }
              }
            }
          ]
        }
      : {}),
    profile:
      input.city || input.country
        ? {
            ...(input.city
              ? {
                  city: {
                    equals: input.city,
                    mode: "insensitive" as const
                  }
                }
              : {}),
            ...(input.country
              ? {
                  country: {
                    equals: input.country,
                    mode: "insensitive" as const
                  }
                }
              : {})
          }
        : undefined
  };
  const totalItems = await prisma.user.count({ where });
  const { skip, take } = getPagination(input);

  const users = await prisma.user.findMany({
    where: {
      ...where
    },
    select: publicUserSelect,
    orderBy:
      input.sortBy === "username"
        ? {
            username: input.order
          }
        : {
            createdAt: input.order
          },
    skip,
    take
  });

  return createPaginatedResponse(users, input, totalItems, {
    city: input.city,
    country: input.country,
    role: input.role,
    search: input.search,
    sortBy: input.sortBy,
    order: input.order
  });
}

export async function followUser(userId: string, targetUserId: string) {
  if (userId === targetUserId) {
    throw new AppError("You cannot follow yourself", 400);
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, username: true }
  });

  if (!targetUser) {
    throw new AppError("Target user not found", 404);
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId: targetUserId
      }
    },
    update: {},
    create: {
      followerId: userId,
      followingId: targetUserId
    }
  });

  await createNotification({
    recipientId: targetUserId,
    actorId: userId,
    message: "You have a new follower",
    type: "FOLLOW"
  });

  return { success: true };
}

export async function unfollowUser(userId: string, targetUserId: string) {
  await prisma.follow.deleteMany({
    where: {
      followerId: userId,
      followingId: targetUserId
    }
  });

  return { success: true };
}

export async function listFollowers(userId: string, input: FollowListInput) {
  const where = {
    followingId: userId,
    ...(input.search
      ? {
          follower: {
            username: {
              contains: input.search,
              mode: "insensitive" as const
            }
          }
        }
      : {})
  };
  const totalItems = await prisma.follow.count({ where });
  const { skip, take } = getPagination(input);

  const followers = await prisma.follow.findMany({
    where: {
      ...where
    },
    include: {
      follower: {
        select: publicUserSelect
      }
    },
    skip,
    take
  });

  return createPaginatedResponse(followers, input, totalItems, {
    search: input.search
  });
}

export async function listFollowing(userId: string, input: FollowListInput) {
  const where = {
    followerId: userId,
    ...(input.search
      ? {
          following: {
            username: {
              contains: input.search,
              mode: "insensitive" as const
            }
          }
        }
      : {})
  };
  const totalItems = await prisma.follow.count({ where });
  const { skip, take } = getPagination(input);

  const following = await prisma.follow.findMany({
    where: {
      ...where
    },
    include: {
      following: {
        select: publicUserSelect
      }
    },
    skip,
    take
  });

  return createPaginatedResponse(following, input, totalItems, {
    search: input.search
  });
}

export async function createGoal(userId: string, input: CreateGoalInput) {
  return prisma.goal.create({
    data: {
      userId,
      title: input.title,
      description: input.description,
      targetDistanceKm: input.targetDistanceKm,
      deadline: input.deadline ? new Date(input.deadline) : undefined
    }
  });
}

export async function listMyGoals(userId: string, input: GoalListInput) {
  const where = {
    userId,
    ...(input.status ? { status: input.status } : {})
  };
  const totalItems = await prisma.goal.count({ where });
  const { skip, take } = getPagination(input);

  const goals = await prisma.goal.findMany({
    where: {
      ...where
    },
    orderBy: {
      createdAt: input.order
    },
    skip,
    take
  });

  return createPaginatedResponse(goals, input, totalItems, {
    status: input.status,
    order: input.order
  });
}

export async function updateGoalProgress(userId: string, goalId: string, input: UpdateGoalProgressInput) {
  const goal = await prisma.goal.findFirst({
    where: {
      id: goalId,
      userId
    }
  });

  if (!goal) {
    throw new AppError("Goal not found", 404);
  }

  const status = input.currentDistanceKm >= goal.targetDistanceKm ? "COMPLETED" : goal.status;

  const updatedGoal = await prisma.goal.update({
    where: {
      id: goalId
    },
    data: {
      currentDistanceKm: input.currentDistanceKm,
      status
    }
  });

  if (status === "COMPLETED" && goal.status !== "COMPLETED") {
    await createNotification({
      recipientId: userId,
      message: `Goal "${goal.title}" completed`,
      type: "GOAL_COMPLETED"
    });
  }

  return updatedGoal;
}

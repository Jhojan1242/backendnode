import prisma from "@/configs/prisma";
import { AppError } from "@/errors/app-error";
import { createNotification } from "@/services/notification.service";
import { discoverableUserSelect, privateUserSelect, publicUserSelect } from "@/services/user.selectors";
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
  latitude?: number;
  longitude?: number;
  radiusKm: number;
  sortBy: "createdAt" | "username" | "distance";
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

export async function getMyProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...privateUserSelect,
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

export async function getPublicUserProfile(userId: string, viewerId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!viewerId || viewerId === userId) {
    return {
      ...user,
      isFollowedByViewer: false
    };
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: viewerId,
        followingId: userId
      }
    },
    select: {
      followerId: true
    }
  });

  return {
    ...user,
    isFollowedByViewer: Boolean(follow)
  };
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
  const hasCoordinates = typeof input.latitude === "number" && typeof input.longitude === "number";
  const profileFilter =
    input.city || input.country
      ? {
          is: {
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
        }
      : undefined;

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
                is: {
                  firstName: {
                    contains: input.search,
                    mode: "insensitive" as const
                  }
                }
              }
            },
            {
              profile: {
                is: {
                  lastName: {
                    contains: input.search,
                    mode: "insensitive" as const
                  }
                }
              }
            }
          ]
        }
      : {}),
    ...(profileFilter ? { profile: profileFilter } : {})
  };
  const { skip, take } = getPagination(input);

  if (!hasCoordinates) {
    const totalItems = await prisma.user.count({ where });
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

  const centerLatitude = input.latitude as number;
  const centerLongitude = input.longitude as number;
  const latitudeDelta = input.radiusKm / 111;
  const longitudeDelta = input.radiusKm / (111 * Math.max(Math.cos((centerLatitude * Math.PI) / 180), 0.1));

  const geoUsers = await prisma.user.findMany({
    where: {
      ...where,
      profile: {
        is: {
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
            : {}),
          latitude: {
            not: null,
            gte: centerLatitude - latitudeDelta,
            lte: centerLatitude + latitudeDelta
          },
          longitude: {
            not: null,
            gte: centerLongitude - longitudeDelta,
            lte: centerLongitude + longitudeDelta
          }
        }
      }
    },
    select: discoverableUserSelect
  });

  const usersWithDistance = geoUsers
    .map((user) => {
      const latitude = user.profile?.latitude;
      const longitude = user.profile?.longitude;

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return null;
      }

      const distanceKm = haversineDistanceKm(centerLatitude, centerLongitude, latitude, longitude);

      if (distanceKm > input.radiusKm) {
        return null;
      }

      return {
        ...user,
        distanceKm
      };
    })
    .filter((user): user is NonNullable<typeof user> => Boolean(user));

  const sortedUsers = usersWithDistance.sort((left, right) => {
    if (input.sortBy === "username") {
      return input.order === "asc"
        ? left.username.localeCompare(right.username)
        : right.username.localeCompare(left.username);
    }

    if (input.sortBy === "createdAt") {
      return input.order === "asc"
        ? new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
        : new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }

    return input.order === "asc" ? left.distanceKm - right.distanceKm : right.distanceKm - left.distanceKm;
  });

  return createPaginatedResponse(sortedUsers.slice(skip, skip + take), input, sortedUsers.length, {
    role: input.role,
    search: input.search,
    sortBy: input.sortBy,
    order: input.order,
    latitude: input.latitude,
    longitude: input.longitude,
    radiusKm: input.radiusKm
  });
}

function haversineDistanceKm(originLat: number, originLng: number, targetLat: number, targetLng: number) {
  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(targetLat - originLat);
  const longitudeDelta = toRadians(targetLng - originLng);
  const originLatRadians = toRadians(originLat);
  const targetLatRadians = toRadians(targetLat);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatRadians) * Math.cos(targetLatRadians) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
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
            is: {
              username: {
                contains: input.search,
                mode: "insensitive" as const
              }
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
            is: {
              username: {
                contains: input.search,
                mode: "insensitive" as const
              }
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

import prisma from "@/configs/prisma";
import { AppError } from "@/errors/app-error";
import { createNotification } from "@/services/notification.service";
import { createPaginatedResponse, getPagination } from "@/utils/pagination";

type CreateTeamInput = {
  name: string;
  description: string;
  city?: string;
};

type CreateJoinRequestInput = {
  message?: string;
};

type ReviewJoinRequestInput = {
  status: "APPROVED" | "REJECTED";
};

type CreateCoachContentInput = {
  type: "PLAN" | "TIP";
  title: string;
  content: string;
  teamId?: string;
};

type ListTeamsInput = {
  page: number;
  limit: number;
  city?: string;
  search?: string;
  sortBy: "createdAt" | "name" | "members";
  order: "asc" | "desc";
};

type ListJoinRequestsInput = {
  page: number;
  limit: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
};

type ListCoachContentsInput = {
  page: number;
  limit: number;
  teamId?: string;
  type?: "PLAN" | "TIP";
  search?: string;
  order: "asc" | "desc";
};

async function ensureCoachPermissions(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      isCoachValidated: true
    }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === "ADMIN") {
    return;
  }

  if (user.role !== "COACH") {
    throw new AppError("Only coaches can perform this action", 403);
  }

  if (!user.isCoachValidated) {
    throw new AppError("Coach account must be validated before creating teams or content", 403);
  }
}

export async function createTeam(userId: string, input: CreateTeamInput) {
  await ensureCoachPermissions(userId);

  return prisma.team.create({
    data: {
      ...input,
      coachId: userId,
      members: {
        create: {
          userId,
          role: "COACH"
        }
      }
    },
    include: {
      coach: {
        select: {
          id: true,
          username: true,
          profile: true
        }
      },
      members: true
    }
  });
}

export async function listTeams(input: ListTeamsInput) {
  const where = {
    ...(input.city
      ? {
          city: {
            equals: input.city,
            mode: "insensitive" as const
          }
        }
      : {}),
    ...(input.search
      ? {
          OR: [
            {
              name: {
                contains: input.search,
                mode: "insensitive" as const
              }
            },
            {
              description: {
                contains: input.search,
                mode: "insensitive" as const
              }
            }
          ]
        }
      : {})
  };
  const totalItems = await prisma.team.count({ where });
  const { skip, take } = getPagination(input);

  const teams = await prisma.team.findMany({
    where,
    include: {
      coach: {
        select: {
          id: true,
          username: true,
          profile: true
        }
      },
      _count: {
        select: {
          members: true,
          joinRequests: true,
          contents: true
        }
      }
    },
    orderBy:
      input.sortBy === "name"
        ? { name: input.order }
        : input.sortBy === "members"
          ? {
              members: {
                _count: input.order
              }
            }
          : {
              createdAt: input.order
            },
    skip,
    take
  });

  return createPaginatedResponse(teams, input, totalItems, {
    city: input.city,
    search: input.search,
    sortBy: input.sortBy,
    order: input.order
  });
}

export async function getTeamById(teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      coach: {
        select: {
          id: true,
          username: true,
          profile: true
        }
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: true
            }
          }
        }
      },
      contents: true
    }
  });

  if (!team) {
    throw new AppError("Team not found", 404);
  }

  return team;
}

export async function requestToJoinTeam(userId: string, teamId: string, input: CreateJoinRequestInput) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      id: true,
      coachId: true
    }
  });

  if (!team) {
    throw new AppError("Team not found", 404);
  }

  const membership = await prisma.teamMembership.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId
      }
    }
  });

  if (membership) {
    throw new AppError("You are already a member of this team", 409);
  }

  const joinRequest = await prisma.teamJoinRequest.upsert({
    where: {
      teamId_userId: {
        teamId,
        userId
      }
    },
    update: {
      status: "PENDING",
      message: input.message
    },
    create: {
      teamId,
      userId,
      message: input.message
    }
  });

  await createNotification({
    recipientId: team.coachId,
    actorId: userId,
    message: "A runner requested to join your team",
    type: "TEAM_JOIN_REQUEST"
  });

  return joinRequest;
}

export async function listTeamJoinRequests(userId: string, teamId: string, input: ListJoinRequestsInput) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: {
      coachId: true
    }
  });

  if (!team) {
    throw new AppError("Team not found", 404);
  }

  if (team.coachId !== userId) {
    throw new AppError("Only the team coach can review join requests", 403);
  }

  const where = {
    teamId,
    ...(input.status ? { status: input.status } : {})
  };
  const totalItems = await prisma.teamJoinRequest.count({ where });
  const { skip, take } = getPagination(input);

  const requests = await prisma.teamJoinRequest.findMany({
    where: {
      ...where
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profile: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    skip,
    take
  });

  return createPaginatedResponse(requests, input, totalItems, {
    status: input.status
  });
}

export async function reviewJoinRequest(userId: string, requestId: string, input: ReviewJoinRequestInput) {
  const joinRequest = await prisma.teamJoinRequest.findUnique({
    where: { id: requestId },
    include: {
      team: true
    }
  });

  if (!joinRequest) {
    throw new AppError("Join request not found", 404);
  }

  if (joinRequest.team.coachId !== userId) {
    throw new AppError("Only the team coach can review join requests", 403);
  }

  const updatedRequest = await prisma.teamJoinRequest.update({
    where: {
      id: requestId
    },
    data: {
      status: input.status
    }
  });

  if (input.status === "APPROVED") {
    await prisma.teamMembership.upsert({
      where: {
        teamId_userId: {
          teamId: joinRequest.teamId,
          userId: joinRequest.userId
        }
      },
      update: {},
      create: {
        teamId: joinRequest.teamId,
        userId: joinRequest.userId
      }
    });
  }

  await createNotification({
    recipientId: joinRequest.userId,
    actorId: userId,
    message:
      input.status === "APPROVED"
        ? "Your team join request was approved"
        : "Your team join request was rejected",
    type: input.status === "APPROVED" ? "TEAM_REQUEST_APPROVED" : "TEAM_REQUEST_REJECTED"
  });

  return updatedRequest;
}

export async function publishCoachContent(userId: string, input: CreateCoachContentInput) {
  await ensureCoachPermissions(userId);

  if (input.teamId) {
    const team = await prisma.team.findUnique({
      where: { id: input.teamId }
    });

    if (!team) {
      throw new AppError("Team not found", 404);
    }

    if (team.coachId !== userId) {
      throw new AppError("You can only publish content for your own team", 403);
    }
  }

  const content = await prisma.coachContent.create({
    data: {
      ...input,
      coachId: userId
    }
  });

  if (input.teamId) {
    const members = await prisma.teamMembership.findMany({
      where: {
        teamId: input.teamId,
        userId: {
          not: userId
        }
      }
    });

    await Promise.all(
      members.map((member) =>
        createNotification({
          recipientId: member.userId,
          actorId: userId,
          message: `New ${input.type.toLowerCase()} published for your team`,
          type: "COACH_CONTENT_PUBLISHED"
        })
      )
    );
  }

  return content;
}

export async function listCoachContents(input: ListCoachContentsInput) {
  const where = {
    ...(input.teamId ? { teamId: input.teamId } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.search
      ? {
          OR: [
            {
              title: {
                contains: input.search,
                mode: "insensitive" as const
              }
            },
            {
              content: {
                contains: input.search,
                mode: "insensitive" as const
              }
            }
          ]
        }
      : {})
  };
  const totalItems = await prisma.coachContent.count({ where });
  const { skip, take } = getPagination(input);

  const contents = await prisma.coachContent.findMany({
    where: {
      ...where
    },
    include: {
      coach: {
        select: {
          id: true,
          username: true,
          profile: true
        }
      },
      team: true
    },
    orderBy: {
      createdAt: input.order
    },
    skip,
    take
  });

  return createPaginatedResponse(contents, input, totalItems, {
    teamId: input.teamId,
    type: input.type,
    search: input.search,
    order: input.order
  });
}

import prisma from "@/configs/prisma";
import { AppError } from "@/errors/app-error";
import { createPaginatedResponse, getPagination } from "@/utils/pagination";
import { Prisma } from "@prisma/client";

const defaultSections = [
  {
    id: "feed",
    name: "Feed",
    description: "Vista social principal con publicaciones del entrenamiento.",
    enabled: true,
    allowedRoles: ["RUNNER", "COACH", "ADMIN"],
    isCritical: false
  },
  {
    id: "posts",
    name: "Posts",
    description: "Creacion y gestion visual de publicaciones con imagen.",
    enabled: true,
    allowedRoles: ["RUNNER", "COACH", "ADMIN"],
    isCritical: false
  },
  {
    id: "comments",
    name: "Comments",
    description: "Interaccion y participacion en conversaciones del feed.",
    enabled: true,
    allowedRoles: ["RUNNER", "COACH", "ADMIN"],
    isCritical: false
  },
  {
    id: "likes",
    name: "Likes",
    description: "Reacciones rapidas a sesiones y tips publicados.",
    enabled: true,
    allowedRoles: ["RUNNER", "COACH", "ADMIN"],
    isCritical: false
  },
  {
    id: "follows",
    name: "Follows",
    description: "Seguimiento de runners y coaches desde el frontend.",
    enabled: true,
    allowedRoles: ["RUNNER", "COACH", "ADMIN"],
    isCritical: false
  },
  {
    id: "teams",
    name: "Teams",
    description: "Equipos, membresias y solicitudes de union.",
    enabled: true,
    allowedRoles: ["RUNNER", "COACH", "ADMIN"],
    isCritical: false
  },
  {
    id: "coach_validation",
    name: "Coach validation",
    description: "Validacion visual de coaches desde el panel admin.",
    enabled: true,
    allowedRoles: ["ADMIN"],
    isCritical: false
  },
  {
    id: "training_plans",
    name: "Training plans",
    description: "Publicacion de planes y seguimiento de cumplimiento.",
    enabled: true,
    allowedRoles: ["COACH", "ADMIN"],
    isCritical: false
  },
  {
    id: "training_tips",
    name: "Training tips",
    description: "Tips, recomendaciones y contenido educativo.",
    enabled: true,
    allowedRoles: ["COACH", "ADMIN"],
    isCritical: false
  },
  {
    id: "goals",
    name: "Goals",
    description: "Metas personales y progreso del entrenamiento.",
    enabled: true,
    allowedRoles: ["RUNNER", "COACH", "ADMIN"],
    isCritical: false
  },
  {
    id: "location_discovery",
    name: "Location discovery",
    description: "Exploracion de runners cercanos y actividad local.",
    enabled: true,
    allowedRoles: ["RUNNER", "COACH", "ADMIN"],
    isCritical: false
  },
  {
    id: "notifications",
    name: "Notifications",
    description: "Centro de notificaciones del producto.",
    enabled: true,
    allowedRoles: ["RUNNER", "COACH", "ADMIN"],
    isCritical: false
  },
  {
    id: "reports",
    name: "Reports",
    description: "Revision de reportes enviados por la comunidad.",
    enabled: true,
    allowedRoles: ["ADMIN"],
    isCritical: false
  },
  {
    id: "user_management",
    name: "User management",
    description: "Suspensiones, estado de cuentas y administracion general.",
    enabled: true,
    allowedRoles: ["ADMIN"],
    isCritical: true
  },
  {
    id: "content_moderation",
    name: "Content moderation",
    description: "Moderacion de publicaciones y comentarios reportados.",
    enabled: true,
    allowedRoles: ["ADMIN"],
    isCritical: true
  },
  {
    id: "admin_panel",
    name: "Admin panel",
    description: "Acceso global al panel de administracion y secciones.",
    enabled: true,
    allowedRoles: ["ADMIN"],
    isCritical: true
  }
] as const;

type CreateReportInput = {
  reason: "SPAM" | "ABUSE" | "HARASSMENT" | "MISINFORMATION" | "OTHER";
  details?: string;
  postId?: string;
  commentId?: string;
};

type ResolveReportInput = {
  action: "dismiss" | "delete_post" | "delete_comment";
};

type ListAdminUsersInput = {
  page: number;
  limit: number;
  role?: "RUNNER" | "COACH" | "ADMIN";
  search?: string;
  isActive?: boolean;
};

function serializeSection(section: {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  allowedRoles: unknown;
  isCritical: boolean;
  updatedAt: Date;
}) {
  return {
    ...section,
    allowedRoles: Array.isArray(section.allowedRoles) ? section.allowedRoles : []
  };
}

function isMissingAppSectionTableError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021" &&
    String(error.meta?.table ?? "").includes("AppSection")
  );
}

async function ensureSectionsSeeded() {
  try {
    await prisma.$transaction(
      defaultSections.map((section) =>
        prisma.appSection.upsert({
          where: { id: section.id },
          update: {},
          create: {
            id: section.id,
            name: section.name,
            description: section.description,
            enabled: section.enabled,
            allowedRoles: section.allowedRoles,
            isCritical: section.isCritical
          }
        })
      )
    );
  } catch (error) {
    if (!isMissingAppSectionTableError(error)) {
      throw error;
    }
  }
}

export async function createReport(reporterId: string, input: CreateReportInput) {
  if (!input.postId && !input.commentId) {
    throw new AppError("A report must target a post or a comment", 400);
  }

  if (input.postId && input.commentId) {
    throw new AppError("A report can only target one resource at a time", 400);
  }

  return prisma.report.create({
    data: {
      reporterId,
      reason: input.reason,
      details: input.details,
      postId: input.postId,
      commentId: input.commentId
    }
  });
}

export async function listReports() {
  return prisma.report.findMany({
    include: {
      reporter: {
        select: {
          id: true,
          username: true
        }
      },
      post: true,
      comment: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function listAdminUsers(input: ListAdminUsersInput) {
  const where = {
    ...(input.role ? { role: input.role } : {}),
    ...(typeof input.isActive === "boolean" ? { isActive: input.isActive } : {}),
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
              email: {
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
      : {})
  };

  const totalItems = await prisma.user.count({ where });
  const { skip, take } = getPagination(input);
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      isCoachValidated: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          city: true,
          country: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    skip,
    take
  });

  return createPaginatedResponse(users, input, totalItems, {
    role: input.role,
    search: input.search,
    isActive: input.isActive
  });
}

export async function listAppSections() {
  await ensureSectionsSeeded();
  let records: Array<{
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    allowedRoles: unknown;
    isCritical: boolean;
    updatedAt: Date;
  }> = [];

  try {
    records = await prisma.appSection.findMany();
  } catch (error) {
    if (!isMissingAppSectionTableError(error)) {
      throw error;
    }
  }

  const sectionMap = new Map(records.map((section) => [section.id, serializeSection(section)]));

  return defaultSections.map((section) => sectionMap.get(section.id) ?? section);
}

export async function updateAppSection(sectionId: string, enabled: boolean) {
  await ensureSectionsSeeded();
  let existing = null;

  try {
    existing = await prisma.appSection.findUnique({
      where: {
        id: sectionId
      }
    });
  } catch (error) {
    if (isMissingAppSectionTableError(error)) {
      throw new AppError("App sections are not migrated in the current database yet", 503);
    }

    throw error;
  }

  if (!existing) {
    throw new AppError("Section not found", 404);
  }

  const updated = await prisma.appSection.update({
    where: {
      id: sectionId
    },
    data: {
      enabled
    }
  });

  return serializeSection(updated);
}

export async function resolveReport(adminId: string, reportId: string, input: ResolveReportInput) {
  const report = await prisma.report.findUnique({
    where: {
      id: reportId
    }
  });

  if (!report) {
    throw new AppError("Report not found", 404);
  }

  return prisma.$transaction(async (tx) => {
    if (input.action === "delete_post" && report.postId) {
      await tx.post.delete({
        where: {
          id: report.postId
        }
      });
    }

    if (input.action === "delete_comment" && report.commentId) {
      await tx.comment.delete({
        where: {
          id: report.commentId
        }
      });
    }

    return tx.report.update({
      where: {
        id: reportId
      },
      data: {
        isResolved: true,
        resolvedById: adminId
      }
    });
  });
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      isActive
    }
  });
}

export async function validateCoach(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role !== "COACH") {
    throw new AppError("Only coach accounts can be validated", 400);
  }

  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      isCoachValidated: true
    }
  });
}

export async function deletePostAsAdmin(postId: string) {
  return prisma.post.delete({
    where: {
      id: postId
    }
  });
}

export async function deleteCommentAsAdmin(commentId: string) {
  return prisma.comment.delete({
    where: {
      id: commentId
    }
  });
}

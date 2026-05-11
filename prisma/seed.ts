import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";

import prisma from "../src/configs/prisma";

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

function isMissingTableError(error: unknown, table: string) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021" &&
    String(error.meta?.table ?? "").includes(table)
  );
}

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const runner = await prisma.user.upsert({
    where: {
      email: "runner@example.com"
    },
    update: {},
    create: {
      email: "runner@example.com",
      username: "runner_demo",
      passwordHash,
      role: "RUNNER",
      isCoachValidated: true,
      profile: {
        create: {
          firstName: "Runner",
          lastName: "Demo",
          city: "Bogota",
          country: "Colombia",
          bio: "Demo runner account"
        }
      }
    }
  });

  const coach = await prisma.user.upsert({
    where: {
      email: "coach@example.com"
    },
    update: {
      isCoachValidated: true
    },
    create: {
      email: "coach@example.com",
      username: "coach_demo",
      passwordHash,
      role: "COACH",
      isCoachValidated: true,
      profile: {
        create: {
          firstName: "Coach",
          lastName: "Demo",
          city: "Bogota",
          country: "Colombia",
          bio: "Demo coach account"
        }
      }
    }
  });

  await prisma.user.upsert({
    where: {
      email: "admin@example.com"
    },
    update: {
      role: "ADMIN",
      isActive: true,
      isCoachValidated: true
    },
    create: {
      email: "admin@example.com",
      username: "admin_demo",
      passwordHash,
      role: "ADMIN",
      isActive: true,
      isCoachValidated: true,
      profile: {
        create: {
          firstName: "Admin",
          lastName: "Demo",
          city: "Bogota",
          country: "Colombia",
          bio: "Demo admin account"
        }
      }
    }
  });

  try {
    for (const section of defaultSections) {
      await prisma.appSection.upsert({
        where: { id: section.id },
        update: {
          name: section.name,
          description: section.description,
          allowedRoles: section.allowedRoles,
          isCritical: section.isCritical
        },
        create: section
      });
    }
  } catch (error) {
    if (!isMissingTableError(error, "AppSection")) {
      throw error;
    }

    console.warn("Skipping AppSection seed because the AppSection table does not exist yet.");
  }

  const existingSeedTeam = await prisma.team.findFirst({
    where: {
      OR: [{ id: "seed-team-demo" }, { coachId: coach.id, name: "Bogota Long Run Crew" }]
    },
    select: {
      id: true
    }
  });

  const team =
    existingSeedTeam
      ? await prisma.team.update({
          where: {
            id: existingSeedTeam.id
          },
          data: {
            name: "Bogota Long Run Crew",
            description: "Sample team created by the seed script.",
            city: "Bogota",
            coachId: coach.id
          }
        })
      : await prisma.team.create({
          data: {
            name: "Bogota Long Run Crew",
            description: "Sample team created by the seed script.",
            city: "Bogota",
            coachId: coach.id
          }
        });

  await prisma.teamMembership.upsert({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId: coach.id
      }
    },
    update: {
      role: "COACH"
    },
    create: {
      teamId: team.id,
      userId: coach.id,
      role: "COACH"
    }
  });

  await prisma.teamMembership.upsert({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId: runner.id
      }
    },
    update: {
      role: "MEMBER"
    },
    create: {
      teamId: team.id,
      userId: runner.id,
      role: "MEMBER"
    }
  });

  const existingSeedPost = await prisma.post.findFirst({
    where: {
      authorId: runner.id,
      caption: "Seed post for the social feed."
    },
    select: {
      id: true
    }
  });

  if (!existingSeedPost) {
    await prisma.post.create({
      data: {
        caption: "Seed post for the social feed.",
        distanceKm: 10,
        durationMinutes: 52,
        locationName: "Simulated City Park",
        authorId: runner.id
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

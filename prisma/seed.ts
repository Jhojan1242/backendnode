import bcrypt from "bcrypt";

import prisma from "../src/configs/prisma";

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

  await prisma.team.upsert({
    where: {
      id: "seed-team-demo"
    },
    update: {},
    create: {
      id: "seed-team-demo",
      name: "Bogota Long Run Crew",
      description: "Sample team created by the seed script.",
      city: "Bogota",
      coachId: coach.id,
      members: {
        createMany: {
          data: [
            { userId: coach.id, role: "COACH" },
            { userId: runner.id, role: "MEMBER" }
          ]
        }
      }
    }
  });

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

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

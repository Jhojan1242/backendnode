-- CreateEnum
ALTER TYPE "NotificationType" ADD VALUE 'TEAM_MEMBER_REMOVED';
ALTER TYPE "NotificationType" ADD VALUE 'TEAM_MEMBER_BLOCKED';

-- CreateTable
CREATE TABLE "TeamBan" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "blockedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamBan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamBan_teamId_userId_key" ON "TeamBan"("teamId", "userId");

-- AddForeignKey
ALTER TABLE "TeamBan" ADD CONSTRAINT "TeamBan_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamBan" ADD CONSTRAINT "TeamBan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamBan" ADD CONSTRAINT "TeamBan_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

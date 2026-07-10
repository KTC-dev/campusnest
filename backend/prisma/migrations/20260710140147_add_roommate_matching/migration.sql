-- CreateEnum
CREATE TYPE "MatchRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'ROOMMATE_MATCH_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'ROOMMATE_MATCH_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE 'ROOMMATE_MATCH_DECLINED';

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_deletedByUserId_fkey";

-- AlterTable
ALTER TABLE "conversations" ALTER COLUMN "primaryStudentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "deliveredAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "gender" "Gender" DEFAULT 'ANY';

-- CreateTable
CREATE TABLE "roommate_match_requests" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "MatchRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "roommate_match_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roommate_match_favourites" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roommate_match_favourites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "roommate_match_requests_senderId_idx" ON "roommate_match_requests"("senderId");

-- CreateIndex
CREATE INDEX "roommate_match_requests_receiverId_status_idx" ON "roommate_match_requests"("receiverId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "roommate_match_requests_senderId_receiverId_key" ON "roommate_match_requests"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "roommate_match_favourites_studentId_idx" ON "roommate_match_favourites"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "roommate_match_favourites_studentId_targetId_key" ON "roommate_match_favourites"("studentId", "targetId");

-- RenameForeignKey
ALTER TABLE "conversations" RENAME CONSTRAINT "conversations_studentId_fkey" TO "conversations_primaryStudentId_fkey";

-- AddForeignKey
ALTER TABLE "roommate_match_requests" ADD CONSTRAINT "roommate_match_requests_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roommate_match_requests" ADD CONSTRAINT "roommate_match_requests_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roommate_match_favourites" ADD CONSTRAINT "roommate_match_favourites_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roommate_match_favourites" ADD CONSTRAINT "roommate_match_favourites_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

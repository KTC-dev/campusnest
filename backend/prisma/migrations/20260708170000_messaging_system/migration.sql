-- CreateEnum
CREATE TYPE "ConversationType" AS ENUM ('PROPERTY_CHAT', 'ROOMMATE_CHAT');

-- CreateTable
CREATE TABLE "roommate_matches" (
    "id" TEXT NOT NULL,
    "studentAId" TEXT NOT NULL,
    "studentBId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roommate_matches_pkey" PRIMARY KEY ("id")
);

-- Rename and extend conversations for property and roommate chats.
ALTER TABLE "conversations" RENAME COLUMN "studentId" TO "primaryStudentId";
ALTER TABLE "conversations" ALTER COLUMN "propertyId" DROP NOT NULL;
ALTER TABLE "conversations" ALTER COLUMN "landlordId" DROP NOT NULL;
ALTER TABLE "conversations" ADD COLUMN "type" "ConversationType" NOT NULL DEFAULT 'PROPERTY_CHAT';
ALTER TABLE "conversations" ADD COLUMN "roommateMatchId" TEXT;
ALTER TABLE "conversations" ADD COLUMN "secondaryStudentId" TEXT;
ALTER TABLE "conversations" ADD COLUMN "lastMessageId" TEXT;
ALTER TABLE "conversations" ADD COLUMN "lastMessageContent" TEXT;
ALTER TABLE "conversations" ADD COLUMN "lastMessageType" "MessageType";
ALTER TABLE "conversations" ADD COLUMN "lastMessageAt" TIMESTAMP(3);
ALTER TABLE "conversations" ADD COLUMN "lastMessageSenderId" TEXT;

-- Add message metadata for read/delivered/deletion states.
ALTER TABLE "messages" ADD COLUMN "readAt" TIMESTAMP(3);
ALTER TABLE "messages" ADD COLUMN "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "messages" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "messages" ADD COLUMN "deletedByUserId" TEXT;

-- Add attachment metadata for upload previews and moderation cleanup.
ALTER TABLE "message_attachments" ADD COLUMN "publicId" TEXT;
ALTER TABLE "message_attachments" ADD COLUMN "fileName" TEXT;
ALTER TABLE "message_attachments" ADD COLUMN "mimeType" TEXT;
ALTER TABLE "message_attachments" ADD COLUMN "fileSize" INTEGER;

-- Backfill existing conversations to property chats and preserve latest message summary data.
UPDATE "conversations"
SET "type" = 'PROPERTY_CHAT';

UPDATE "conversations" c
SET
    "lastMessageId" = latest."id",
    "lastMessageContent" = latest."content",
    "lastMessageType" = latest."messageType",
    "lastMessageAt" = latest."createdAt",
    "lastMessageSenderId" = latest."senderId"
FROM LATERAL (
    SELECT m."id", m."content", m."messageType", m."createdAt", m."senderId"
    FROM "messages" m
    WHERE m."conversationId" = c."id"
    ORDER BY m."createdAt" DESC
    LIMIT 1
) AS latest;

-- Add indexes to match the updated Prisma schema.
DROP INDEX IF EXISTS "conversations_studentId_idx";
CREATE UNIQUE INDEX "conversations_roommateMatchId_key" ON "conversations"("roommateMatchId");
CREATE UNIQUE INDEX "conversations_propertyId_primaryStudentId_landlordId_key" ON "conversations"("propertyId", "primaryStudentId", "landlordId");
CREATE INDEX "conversations_primaryStudentId_idx" ON "conversations"("primaryStudentId");
CREATE INDEX "conversations_secondaryStudentId_idx" ON "conversations"("secondaryStudentId");
CREATE INDEX "conversations_type_updatedAt_idx" ON "conversations"("type", "updatedAt");
CREATE INDEX "roommate_matches_studentAId_idx" ON "roommate_matches"("studentAId");
CREATE INDEX "roommate_matches_studentBId_idx" ON "roommate_matches"("studentBId");
CREATE UNIQUE INDEX "roommate_matches_studentAId_studentBId_key" ON "roommate_matches"("studentAId", "studentBId");

-- Add foreign keys for the new schema links.
ALTER TABLE "roommate_matches" ADD CONSTRAINT "roommate_matches_studentAId_fkey" FOREIGN KEY ("studentAId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "roommate_matches" ADD CONSTRAINT "roommate_matches_studentBId_fkey" FOREIGN KEY ("studentBId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_roommateMatchId_fkey" FOREIGN KEY ("roommateMatchId") REFERENCES "roommate_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_secondaryStudentId_fkey" FOREIGN KEY ("secondaryStudentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

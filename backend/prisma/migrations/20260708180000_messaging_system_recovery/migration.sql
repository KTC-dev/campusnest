-- CreateEnum
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'ConversationType'
    ) THEN
        CREATE TYPE "ConversationType" AS ENUM ('PROPERTY_CHAT', 'ROOMMATE_CHAT');
    END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "roommate_matches" (
    "id" TEXT NOT NULL,
    "studentAId" TEXT NOT NULL,
    "studentBId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roommate_matches_pkey" PRIMARY KEY ("id")
);

-- Rename and extend conversations for property and roommate chats.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'conversations'
          AND column_name = 'studentId'
    ) AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'conversations'
          AND column_name = 'primaryStudentId'
    ) THEN
        EXECUTE 'ALTER TABLE "conversations" RENAME COLUMN "studentId" TO "primaryStudentId"';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'conversations'
          AND column_name = 'propertyId'
    ) THEN
        EXECUTE 'ALTER TABLE "conversations" ALTER COLUMN "propertyId" DROP NOT NULL';
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'conversations'
          AND column_name = 'landlordId'
    ) THEN
        EXECUTE 'ALTER TABLE "conversations" ALTER COLUMN "landlordId" DROP NOT NULL';
    END IF;
END $$;

ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "type" "ConversationType";
UPDATE "conversations"
SET "type" = 'PROPERTY_CHAT'
WHERE "type" IS NULL;
ALTER TABLE "conversations" ALTER COLUMN "type" SET DEFAULT 'PROPERTY_CHAT';
ALTER TABLE "conversations" ALTER COLUMN "type" SET NOT NULL;

ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "roommateMatchId" TEXT;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "secondaryStudentId" TEXT;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "lastMessageId" TEXT;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "lastMessageContent" TEXT;
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "lastMessageType" "MessageType";
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "lastMessageAt" TIMESTAMP(3);
ALTER TABLE "conversations" ADD COLUMN IF NOT EXISTS "lastMessageSenderId" TEXT;

-- Add message metadata for read/delivered/deletion states.
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "readAt" TIMESTAMP(3);
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "deliveredAt" TIMESTAMP(3);
UPDATE "messages"
SET "deliveredAt" = COALESCE("deliveredAt", CURRENT_TIMESTAMP)
WHERE "deliveredAt" IS NULL;
ALTER TABLE "messages" ALTER COLUMN "deliveredAt" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "messages" ALTER COLUMN "deliveredAt" SET NOT NULL;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "deletedByUserId" TEXT;

-- Add attachment metadata for upload previews and moderation cleanup.
ALTER TABLE "message_attachments" ADD COLUMN IF NOT EXISTS "publicId" TEXT;
ALTER TABLE "message_attachments" ADD COLUMN IF NOT EXISTS "fileName" TEXT;
ALTER TABLE "message_attachments" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE "message_attachments" ADD COLUMN IF NOT EXISTS "fileSize" INTEGER;

-- Backfill existing conversations to property chats and preserve latest message summary data.
UPDATE "conversations"
SET "type" = 'PROPERTY_CHAT'
WHERE "type" IS NULL;

UPDATE "conversations" c
SET
    "lastMessageId" = (
        SELECT m."id"
        FROM "messages" m
        WHERE m."conversationId" = c."id"
        ORDER BY m."createdAt" DESC
        LIMIT 1
    ),
    "lastMessageContent" = (
        SELECT m."content"
        FROM "messages" m
        WHERE m."conversationId" = c."id"
        ORDER BY m."createdAt" DESC
        LIMIT 1
    ),
    "lastMessageType" = (
        SELECT m."messageType"
        FROM "messages" m
        WHERE m."conversationId" = c."id"
        ORDER BY m."createdAt" DESC
        LIMIT 1
    ),
    "lastMessageAt" = (
        SELECT m."createdAt"
        FROM "messages" m
        WHERE m."conversationId" = c."id"
        ORDER BY m."createdAt" DESC
        LIMIT 1
    ),
    "lastMessageSenderId" = (
        SELECT m."senderId"
        FROM "messages" m
        WHERE m."conversationId" = c."id"
        ORDER BY m."createdAt" DESC
        LIMIT 1
    );

-- Add indexes to match the updated Prisma schema.
DROP INDEX IF EXISTS "conversations_studentId_idx";
CREATE UNIQUE INDEX IF NOT EXISTS "conversations_roommateMatchId_key" ON "conversations"("roommateMatchId");
CREATE UNIQUE INDEX IF NOT EXISTS "conversations_propertyId_primaryStudentId_landlordId_key" ON "conversations"("propertyId", "primaryStudentId", "landlordId");
CREATE INDEX IF NOT EXISTS "conversations_primaryStudentId_idx" ON "conversations"("primaryStudentId");
CREATE INDEX IF NOT EXISTS "conversations_secondaryStudentId_idx" ON "conversations"("secondaryStudentId");
CREATE INDEX IF NOT EXISTS "conversations_type_updatedAt_idx" ON "conversations"("type", "updatedAt");
CREATE INDEX IF NOT EXISTS "roommate_matches_studentAId_idx" ON "roommate_matches"("studentAId");
CREATE INDEX IF NOT EXISTS "roommate_matches_studentBId_idx" ON "roommate_matches"("studentBId");
CREATE UNIQUE INDEX IF NOT EXISTS "roommate_matches_studentAId_studentBId_key" ON "roommate_matches"("studentAId", "studentBId");

-- Add foreign keys for the new schema links.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'roommate_matches_studentAId_fkey'
    ) THEN
        ALTER TABLE "roommate_matches" ADD CONSTRAINT "roommate_matches_studentAId_fkey" FOREIGN KEY ("studentAId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'roommate_matches_studentBId_fkey'
    ) THEN
        ALTER TABLE "roommate_matches" ADD CONSTRAINT "roommate_matches_studentBId_fkey" FOREIGN KEY ("studentBId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'conversations_roommateMatchId_fkey'
    ) THEN
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_roommateMatchId_fkey" FOREIGN KEY ("roommateMatchId") REFERENCES "roommate_matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'conversations_secondaryStudentId_fkey'
    ) THEN
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_secondaryStudentId_fkey" FOREIGN KEY ("secondaryStudentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'messages_deletedByUserId_fkey'
    ) THEN
        ALTER TABLE "messages" ADD CONSTRAINT "messages_deletedByUserId_fkey" FOREIGN KEY ("deletedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
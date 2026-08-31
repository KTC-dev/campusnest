-- Expand reviews table for reputation features
ALTER TABLE "reviews" ADD COLUMN "isApproved" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "reviews" ADD COLUMN "isFlagged" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "reviews" ADD COLUMN "flaggedReason" TEXT;
ALTER TABLE "reviews" ADD COLUMN "helpfulCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "reviews" ADD COLUMN "unhelpfulCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "reviews" ADD COLUMN "agentResponse" TEXT;
ALTER TABLE "reviews" ADD COLUMN "agentRespondedAt" TIMESTAMP;
ALTER TABLE "reviews" ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now();

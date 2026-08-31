-- Rename landlord tables to agent tables
-- This preserves all existing data

ALTER TABLE "landlords" RENAME TO "agents";
ALTER TABLE "landlord_verifications" RENAME TO "agent_verifications";

-- Rename columns in other tables that reference landlord
ALTER TABLE "properties" RENAME COLUMN "landlordId" TO "agentId";
ALTER TABLE "conversations" RENAME COLUMN "landlordId" TO "agentId";

-- Rename indexes on the renamed columns
ALTER INDEX "properties_landlordId_idx" RENAME TO "properties_agentId_idx";
ALTER INDEX "conversations_landlordId_idx" RENAME TO "conversations_agentId_idx";
ALTER INDEX "conversations_propertyId_primaryStudentId_landlordId_key" RENAME TO "conversations_propertyId_primaryStudentId_agentId_key";

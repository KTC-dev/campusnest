-- Add nullable column for landlord verification submitter confirmation.
-- Backward compatible: existing rows remain untouched and new rows can set the flag explicitly.
ALTER TABLE "landlord_verifications"
ADD COLUMN IF NOT EXISTS "submitterConfirmation" BOOLEAN;

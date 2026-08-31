-- Add AGENT to Role enum
ALTER TYPE "Role" ADD VALUE 'AGENT';

-- Migrate existing LANDLORD users to AGENT
UPDATE "users" SET role = 'AGENT' WHERE role = 'LANDLORD';

-- Remove LANDLORD from Role enum
-- PostgreSQL does not support direct enum value removal, so we recreate the enum
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT;
ALTER TABLE "users" ALTER COLUMN "role" DROP NOT NULL;

-- Create new enum without LANDLORD
CREATE TYPE "Role_new" AS ENUM ('STUDENT', 'AGENT', 'ADMIN');

-- Update column to use new enum
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING (
  CASE "role"
    WHEN 'STUDENT' THEN 'STUDENT'::"Role_new"
    WHEN 'AGENT' THEN 'AGENT'::"Role_new"
    WHEN 'ADMIN' THEN 'ADMIN'::"Role_new"
    ELSE 'STUDENT'::"Role_new"
  END
);

ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STUDENT';
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;

-- Drop old enum and rename new one
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";

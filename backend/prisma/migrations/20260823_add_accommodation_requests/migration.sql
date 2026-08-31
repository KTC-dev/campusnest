-- Create enums for accommodation requests
CREATE TYPE "RoomTypePreference" AS ENUM ('SELF_CONTAIN', 'SHARED', 'ONE_BEDROOM', 'TWO_BEDROOM', 'HOSTEL', 'ANY');
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'CLOSED');

-- Create accommodation_requests table
CREATE TABLE "accommodation_requests" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "studentId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "preferredLocation" TEXT NOT NULL,
    "budgetMin" DECIMAL(10,2),
    "budgetMax" DECIMAL(10,2),
    "roomType" "RoomTypePreference" NOT NULL DEFAULT 'ANY',
    "genderPreference" "Gender" NOT NULL DEFAULT 'ANY',
    "moveInDate" TIMESTAMP,
    "numberOfOccupants" INTEGER NOT NULL DEFAULT 1,
    "roommateRequired" BOOLEAN NOT NULL DEFAULT false,
    "preferences" TEXT,
    "additionalNotes" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "respondedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "accommodation_requests_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "accommodation_requests_studentId_status_idx" ON "accommodation_requests"("studentId", "status");
CREATE INDEX "accommodation_requests_universityId_status_idx" ON "accommodation_requests"("universityId", "status");

-- Add foreign keys
ALTER TABLE "accommodation_requests" ADD CONSTRAINT "accommodation_requests_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accommodation_requests" ADD CONSTRAINT "accommodation_requests_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "universities"("id") ON UPDATE CASCADE;


-- Add location fields to properties table for Google Maps integration
ALTER TABLE "properties" ADD COLUMN "latitude" DECIMAL(10,8);
ALTER TABLE "properties" ADD COLUMN "longitude" DECIMAL(11,8);
ALTER TABLE "properties" ADD COLUMN "formattedAddress" TEXT;
ALTER TABLE "properties" ADD COLUMN "placeId" TEXT;
ALTER TABLE "properties" ADD COLUMN "locationVisibility" TEXT NOT NULL DEFAULT 'public';


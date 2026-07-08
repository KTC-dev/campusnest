-- AlterTable
ALTER TABLE "users"
ADD COLUMN     "acceptedTerms" BOOLEAN DEFAULT false,
ADD COLUMN     "acceptedTermsVersion" TEXT,
ADD COLUMN     "acceptedTermsAt" TIMESTAMP(3);
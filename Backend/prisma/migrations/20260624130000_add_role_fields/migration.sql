-- Add restaurant and NGO specific columns
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "businessName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cuisineType" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ngoRegNumber" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "contactPerson" TEXT;

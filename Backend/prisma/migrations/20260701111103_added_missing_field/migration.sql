-- AlterTable
ALTER TABLE "Beneficiary" ADD COLUMN     "lastServed" TEXT,
ADD COLUMN     "mealsReceived" INTEGER NOT NULL DEFAULT 0;

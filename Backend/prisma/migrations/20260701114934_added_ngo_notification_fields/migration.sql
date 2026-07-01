-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifNgoDigest" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifNgoDonations" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifNgoSms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifNgoStatus" BOOLEAN NOT NULL DEFAULT true;

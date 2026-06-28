-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "notifEmailDigest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifEmailListings" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifEmailOrders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifSmsListings" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notifSmsOrders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "privacyPublicProfile" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "privacyShowLeaderboard" BOOLEAN NOT NULL DEFAULT true;

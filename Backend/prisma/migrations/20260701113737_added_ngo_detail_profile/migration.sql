-- AlterTable
ALTER TABLE "User" ADD COLUMN     "document12A" TEXT,
ADD COLUMN     "document12AStatus" TEXT DEFAULT 'No Document',
ADD COLUMN     "document80G" TEXT,
ADD COLUMN     "document80GStatus" TEXT DEFAULT 'No Document',
ADD COLUMN     "documentDeed" TEXT,
ADD COLUMN     "documentDeedStatus" TEXT DEFAULT 'No Document',
ADD COLUMN     "documentReg" TEXT,
ADD COLUMN     "documentRegStatus" TEXT DEFAULT 'No Document',
ADD COLUMN     "serviceRadius" DOUBLE PRECISION DEFAULT 15,
ADD COLUMN     "website" TEXT;

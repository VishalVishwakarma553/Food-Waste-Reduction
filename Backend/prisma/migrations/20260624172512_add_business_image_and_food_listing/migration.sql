-- AlterTable
ALTER TABLE "User" ADD COLUMN     "businessImage" TEXT;

-- CreateTable
CREATE TABLE "FoodListing" (
    "id" SERIAL NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "description" TEXT,
    "tags" TEXT,
    "images" TEXT NOT NULL DEFAULT '[]',
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "discountedPrice" DOUBLE PRECISION NOT NULL,
    "minOrder" DOUBLE PRECISION,
    "expiryDate" TEXT NOT NULL,
    "expiryTime" TEXT NOT NULL,
    "availableFrom" TIMESTAMP(3),
    "availableUntil" TIMESTAMP(3),
    "ingredients" TEXT,
    "allergens" TEXT NOT NULL DEFAULT '[]',
    "dietary" TEXT NOT NULL DEFAULT '[]',
    "storage" TEXT,
    "pickup" BOOLEAN NOT NULL DEFAULT true,
    "delivery" BOOLEAN NOT NULL DEFAULT false,
    "deliveryRadius" DOUBLE PRECISION,
    "packaging" TEXT,
    "instructions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodListing_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FoodListing" ADD CONSTRAINT "FoodListing_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

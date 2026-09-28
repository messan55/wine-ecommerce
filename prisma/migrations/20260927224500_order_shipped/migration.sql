-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'shipped';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "shippedAt" TIMESTAMP(3);

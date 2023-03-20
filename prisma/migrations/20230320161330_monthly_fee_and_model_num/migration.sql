/*
  Warnings:

  - You are about to drop the column `campusId` on the `Vendor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Campus" ADD COLUMN     "monthlyFee" DOUBLE PRECISION NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE "Machine" ADD COLUMN     "modelNumber" TEXT;

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "campusId";

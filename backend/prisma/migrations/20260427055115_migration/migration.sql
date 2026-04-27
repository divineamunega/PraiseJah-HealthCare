-- CreateEnum
CREATE TYPE "LabOrderStatus" AS ENUM ('PENDING', 'COMPLETED');

-- AlterTable
ALTER TABLE "lab_orders" ADD COLUMN     "results" JSONB,
ADD COLUMN     "status" "LabOrderStatus" NOT NULL DEFAULT 'PENDING';

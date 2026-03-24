/*
  Warnings:

  - You are about to drop the column `isActive` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ActiveStatus" AS ENUM ('SUSPENDED', 'PENDING', 'ACTIVE');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "isActive",
ADD COLUMN     "status" "ActiveStatus" NOT NULL DEFAULT 'PENDING';

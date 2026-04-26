/*
  Warnings:

  - A unique constraint covering the columns `[visitId]` on the table `clinical_notes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "QueueStatus" ADD VALUE 'WAITING_FOR_LAB';
ALTER TYPE "QueueStatus" ADD VALUE 'WAITING_FOR_PHARMACY';

-- AlterTable
ALTER TABLE "clinical_notes" ADD COLUMN     "chiefComplaint" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clinical_notes_visitId_key" ON "clinical_notes"("visitId");

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

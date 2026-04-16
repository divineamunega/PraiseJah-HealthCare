-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "correlationId" TEXT;

-- CreateIndex
CREATE INDEX "audit_logs_correlationId_idx" ON "audit_logs"("correlationId");

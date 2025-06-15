-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "anonymousIp" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Question_anonymousIp_createdAt_idx" ON "Question"("anonymousIp", "createdAt");

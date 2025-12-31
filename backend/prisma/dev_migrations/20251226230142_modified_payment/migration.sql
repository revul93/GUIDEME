-- AlterTable
ALTER TABLE "CaseQuote" ADD COLUMN "internalNotes" TEXT;
ALTER TABLE "CaseQuote" ADD COLUMN "notes" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "refundNotes" TEXT;
ALTER TABLE "Payment" ADD COLUMN "refundRequestedAt" DATETIME;

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" REAL NOT NULL,
    "maxDiscountAmount" REAL,
    "minOrderAmount" REAL NOT NULL DEFAULT 0,
    "maxUsesTotal" INTEGER,
    "maxUsesPerClient" INTEGER,
    "validFrom" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "internalNotes" TEXT,
    "createdByAdminId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "DiscountCode_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "DesignerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscountUsage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "discountCodeId" INTEGER NOT NULL,
    "clientProfileId" INTEGER NOT NULL,
    "caseId" INTEGER NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "originalAmount" REAL NOT NULL,
    "discountAmount" REAL NOT NULL,
    "finalAmount" REAL NOT NULL,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DiscountUsage_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiscountUsage_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiscountUsage_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DiscountUsage_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "CaseQuote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CaseQuote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quoteNumber" TEXT NOT NULL,
    "caseId" INTEGER NOT NULL,
    "studyFee" REAL NOT NULL DEFAULT 100,
    "designFee" REAL NOT NULL DEFAULT 0,
    "productionFee" REAL NOT NULL DEFAULT 0,
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    "subtotal" REAL NOT NULL,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "discountReason" TEXT,
    "discountCodeId" INTEGER,
    "vatRate" REAL NOT NULL DEFAULT 15,
    "vatAmount" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "isSent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" DATETIME,
    "isAccepted" BOOLEAN NOT NULL DEFAULT false,
    "acceptedAt" DATETIME,
    "isRejected" BOOLEAN NOT NULL DEFAULT false,
    "rejectedAt" DATETIME,
    "rejectionReason" TEXT,
    "validUntil" DATETIME,
    "internalNotes" TEXT,
    "notes" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "CaseQuote_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseQuote_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "DiscountCode" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CaseQuote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "DesignerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CaseQuote" ("acceptedAt", "caseId", "createdAt", "createdById", "deletedAt", "deliveryFee", "designFee", "discountAmount", "discountReason", "id", "internalNotes", "isAccepted", "isRejected", "isSent", "notes", "productionFee", "quoteNumber", "rejectedAt", "rejectionReason", "sentAt", "studyFee", "subtotal", "totalAmount", "updatedAt", "validUntil", "vatAmount", "vatRate") SELECT "acceptedAt", "caseId", "createdAt", "createdById", "deletedAt", "deliveryFee", "designFee", "discountAmount", "discountReason", "id", "internalNotes", "isAccepted", "isRejected", "isSent", "notes", "productionFee", "quoteNumber", "rejectedAt", "rejectionReason", "sentAt", "studyFee", "subtotal", "totalAmount", "updatedAt", "validUntil", "vatAmount", "vatRate" FROM "CaseQuote";
DROP TABLE "CaseQuote";
ALTER TABLE "new_CaseQuote" RENAME TO "CaseQuote";
CREATE UNIQUE INDEX "CaseQuote_quoteNumber_key" ON "CaseQuote"("quoteNumber");
CREATE INDEX "CaseQuote_caseId_idx" ON "CaseQuote"("caseId");
CREATE INDEX "CaseQuote_quoteNumber_idx" ON "CaseQuote"("quoteNumber");
CREATE INDEX "CaseQuote_createdById_idx" ON "CaseQuote"("createdById");
CREATE INDEX "CaseQuote_deletedAt_idx" ON "CaseQuote"("deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");

-- CreateIndex
CREATE INDEX "DiscountCode_code_isActive_idx" ON "DiscountCode"("code", "isActive");

-- CreateIndex
CREATE INDEX "DiscountCode_validFrom_validUntil_idx" ON "DiscountCode"("validFrom", "validUntil");

-- CreateIndex
CREATE INDEX "DiscountCode_deletedAt_idx" ON "DiscountCode"("deletedAt");

-- CreateIndex
CREATE INDEX "DiscountUsage_discountCodeId_clientProfileId_idx" ON "DiscountUsage"("discountCodeId", "clientProfileId");

-- CreateIndex
CREATE INDEX "DiscountUsage_caseId_idx" ON "DiscountUsage"("caseId");

-- CreateIndex
CREATE INDEX "DiscountUsage_quoteId_idx" ON "DiscountUsage"("quoteId");

-- CreateTable
CREATE TABLE "Case" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caseNumber" TEXT NOT NULL,
    "clientProfileId" INTEGER NOT NULL,
    "patientRef" TEXT,
    "procedureCategory" TEXT NOT NULL,
    "guideType" TEXT NOT NULL,
    "requiredService" TEXT NOT NULL,
    "implantSystem" TEXT,
    "implantSystemOther" TEXT,
    "teethNumbers" TEXT,
    "clinicalNotes" TEXT,
    "specialInstructions" TEXT,
    "status" TEXT NOT NULL,
    "submittedAt" DATETIME,
    "studyCompletedAt" DATETIME,
    "studyCompletedById" INTEGER,
    "deliveryMethod" TEXT,
    "deliveryAddressId" INTEGER,
    "pickupBranchId" INTEGER,
    "actualDeliveryDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "cancelledAt" DATETIME,
    "cancellationReason" TEXT,
    CONSTRAINT "Case_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Case_studyCompletedById_fkey" FOREIGN KEY ("studyCompletedById") REFERENCES "DesignerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Case_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "Address" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Case_pickupBranchId_fkey" FOREIGN KEY ("pickupBranchId") REFERENCES "Branch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseFile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caseId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "description" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "uploadedById" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseFile_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseComment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caseId" INTEGER NOT NULL,
    "authorType" TEXT NOT NULL,
    "clientProfileId" INTEGER,
    "designerProfileId" INTEGER,
    "comment" TEXT NOT NULL,
    "attachments" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CaseComment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseComment_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CaseComment_designerProfileId_fkey" FOREIGN KEY ("designerProfileId") REFERENCES "DesignerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseStatusHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caseId" INTEGER NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedById" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseStatusHistory_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "DesignerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaseQuote" (
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
    "createdById" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CaseQuote_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseQuote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "DesignerProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "paymentNumber" TEXT NOT NULL,
    "caseId" INTEGER NOT NULL,
    "quoteId" INTEGER,
    "clientProfileId" INTEGER NOT NULL,
    "paymentType" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "proofUrl" TEXT,
    "proofUploadedAt" DATETIME,
    "hyperPayCheckoutId" TEXT,
    "hyperPayResourcePath" TEXT,
    "cardLast4" TEXT,
    "cardBrand" TEXT,
    "transactionId" TEXT,
    "transactionDate" DATETIME,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedById" INTEGER,
    "verifiedAt" DATETIME,
    "rejectionReason" TEXT,
    "isRefunded" BOOLEAN NOT NULL DEFAULT false,
    "refundedAmount" REAL,
    "refundedAt" DATETIME,
    "refundReason" TEXT,
    "notes" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "CaseQuote" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "DesignerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceCatalog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "procedureCategory" TEXT NOT NULL,
    "guideType" TEXT NOT NULL,
    "requiredService" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "description" TEXT,
    "descriptionAr" TEXT,
    "studyFee" REAL NOT NULL DEFAULT 100,
    "baseDesignFee" REAL NOT NULL DEFAULT 0,
    "baseProductionFee" REAL NOT NULL DEFAULT 0,
    "perToothFee" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "street" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "workingHours" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Case_caseNumber_key" ON "Case"("caseNumber");

-- CreateIndex
CREATE INDEX "Case_clientProfileId_status_idx" ON "Case"("clientProfileId", "status");

-- CreateIndex
CREATE INDEX "Case_caseNumber_idx" ON "Case"("caseNumber");

-- CreateIndex
CREATE INDEX "Case_status_createdAt_idx" ON "Case"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CaseFile_caseId_category_idx" ON "CaseFile"("caseId", "category");

-- CreateIndex
CREATE INDEX "CaseComment_caseId_createdAt_idx" ON "CaseComment"("caseId", "createdAt");

-- CreateIndex
CREATE INDEX "CaseComment_caseId_isRead_idx" ON "CaseComment"("caseId", "isRead");

-- CreateIndex
CREATE INDEX "CaseStatusHistory_caseId_createdAt_idx" ON "CaseStatusHistory"("caseId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CaseQuote_quoteNumber_key" ON "CaseQuote"("quoteNumber");

-- CreateIndex
CREATE INDEX "CaseQuote_caseId_idx" ON "CaseQuote"("caseId");

-- CreateIndex
CREATE INDEX "CaseQuote_quoteNumber_idx" ON "CaseQuote"("quoteNumber");

-- CreateIndex
CREATE INDEX "CaseQuote_createdById_idx" ON "CaseQuote"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentNumber_key" ON "Payment"("paymentNumber");

-- CreateIndex
CREATE INDEX "Payment_caseId_status_idx" ON "Payment"("caseId", "status");

-- CreateIndex
CREATE INDEX "Payment_clientProfileId_idx" ON "Payment"("clientProfileId");

-- CreateIndex
CREATE INDEX "Payment_paymentType_status_idx" ON "Payment"("paymentType", "status");

-- CreateIndex
CREATE INDEX "Payment_transactionId_idx" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_verifiedById_idx" ON "Payment"("verifiedById");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCatalog_code_key" ON "ServiceCatalog"("code");

-- CreateIndex
CREATE INDEX "ServiceCatalog_isActive_idx" ON "ServiceCatalog"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCatalog_procedureCategory_guideType_requiredService_key" ON "ServiceCatalog"("procedureCategory", "guideType", "requiredService");

-- CreateIndex
CREATE INDEX "Branch_isActive_idx" ON "Branch"("isActive");

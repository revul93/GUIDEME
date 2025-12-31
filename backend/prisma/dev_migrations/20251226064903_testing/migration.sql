-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "role" TEXT NOT NULL DEFAULT 'client',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "accountStatus" TEXT NOT NULL DEFAULT 'active',
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastFailedLoginAt" DATETIME,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" DATETIME,
    "lockedUntil" DATETIME,
    "lockReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "clientType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT,
    "specialtyOther" TEXT,
    "clinicName" TEXT,
    "labName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DesignerProfile" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "specialization" TEXT,
    "experienceYears" INTEGER,
    "bio" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DesignerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Address" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clientProfileId" INTEGER NOT NULL,
    "label" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT,
    "street" TEXT NOT NULL,
    "building" TEXT,
    "postalCode" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "placeId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Address_clientProfileId_fkey" FOREIGN KEY ("clientProfileId") REFERENCES "ClientProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "identifier" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" DATETIME,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OtpCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoginHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "location" TEXT,
    "deviceInfo" TEXT,
    "success" BOOLEAN NOT NULL,
    "failureReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TokenBlacklist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

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
    "changedByClientId" INTEGER,
    "changedByDesignerId" INTEGER,
    "changedBy" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseStatusHistory_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseStatusHistory_changedByClientId_fkey" FOREIGN KEY ("changedByClientId") REFERENCES "ClientProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CaseStatusHistory_changedByDesignerId_fkey" FOREIGN KEY ("changedByDesignerId") REFERENCES "DesignerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phoneNumber_idx" ON "User"("phoneNumber");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_accountStatus_idx" ON "User"("accountStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE INDEX "ClientProfile_clientType_idx" ON "ClientProfile"("clientType");

-- CreateIndex
CREATE UNIQUE INDEX "DesignerProfile_userId_key" ON "DesignerProfile"("userId");

-- CreateIndex
CREATE INDEX "DesignerProfile_isAdmin_idx" ON "DesignerProfile"("isAdmin");

-- CreateIndex
CREATE INDEX "Address_clientProfileId_isDefault_idx" ON "Address"("clientProfileId", "isDefault");

-- CreateIndex
CREATE INDEX "OtpCode_userId_isUsed_expiresAt_idx" ON "OtpCode"("userId", "isUsed", "expiresAt");

-- CreateIndex
CREATE INDEX "OtpCode_identifier_channel_purpose_isUsed_expiresAt_idx" ON "OtpCode"("identifier", "channel", "purpose", "isUsed", "expiresAt");

-- CreateIndex
CREATE INDEX "OtpCode_expiresAt_idx" ON "OtpCode"("expiresAt");

-- CreateIndex
CREATE INDEX "LoginHistory_userId_createdAt_idx" ON "LoginHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LoginHistory_success_createdAt_idx" ON "LoginHistory"("success", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TokenBlacklist_token_key" ON "TokenBlacklist"("token");

-- CreateIndex
CREATE INDEX "TokenBlacklist_token_expiresAt_idx" ON "TokenBlacklist"("token", "expiresAt");

-- CreateIndex
CREATE INDEX "TokenBlacklist_userId_idx" ON "TokenBlacklist"("userId");

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

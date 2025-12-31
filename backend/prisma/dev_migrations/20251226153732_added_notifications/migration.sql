-- AlterTable
ALTER TABLE "Address" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "Case" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "CaseComment" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "CaseFile" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "CaseQuote" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "ClientProfile" ADD COLUMN "profileImageUrl" TEXT;

-- AlterTable
ALTER TABLE "DesignerProfile" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "DesignerProfile" ADD COLUMN "profileImageUrl" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "ServiceCatalog" ADD COLUMN "deletedAt" DATETIME;

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "templateUsed" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "subject" TEXT,
    "title" TEXT,
    "body" TEXT,
    "actionUrl" TEXT,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" DATETIME,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "error" TEXT,
    "errorCode" TEXT,
    "messageId" TEXT,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
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
    "preferredLanguage" TEXT NOT NULL DEFAULT 'ar',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Riyadh',
    "notificationPreferences" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME,
    "deletedAt" DATETIME
);
INSERT INTO "new_User" ("accountStatus", "createdAt", "deletedAt", "email", "emailVerified", "failedLoginAttempts", "id", "isLocked", "lastFailedLoginAt", "lastLoginAt", "lockReason", "lockedAt", "lockedUntil", "phoneNumber", "phoneVerified", "role", "updatedAt") SELECT "accountStatus", "createdAt", "deletedAt", "email", "emailVerified", "failedLoginAttempts", "id", "isLocked", "lastFailedLoginAt", "lastLoginAt", "lockReason", "lockedAt", "lockedUntil", "phoneNumber", "phoneVerified", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_phoneNumber_idx" ON "User"("phoneNumber");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_accountStatus_idx" ON "User"("accountStatus");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "NotificationLog_userId_type_createdAt_idx" ON "NotificationLog"("userId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationLog_userId_purpose_createdAt_idx" ON "NotificationLog"("userId", "purpose", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationLog_userId_isRead_createdAt_idx" ON "NotificationLog"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationLog_sent_createdAt_idx" ON "NotificationLog"("sent", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationLog_createdAt_idx" ON "NotificationLog"("createdAt");

-- CreateIndex
CREATE INDEX "Address_deletedAt_idx" ON "Address"("deletedAt");

-- CreateIndex
CREATE INDEX "Branch_deletedAt_idx" ON "Branch"("deletedAt");

-- CreateIndex
CREATE INDEX "Case_deletedAt_idx" ON "Case"("deletedAt");

-- CreateIndex
CREATE INDEX "CaseComment_deletedAt_idx" ON "CaseComment"("deletedAt");

-- CreateIndex
CREATE INDEX "CaseFile_deletedAt_idx" ON "CaseFile"("deletedAt");

-- CreateIndex
CREATE INDEX "CaseQuote_deletedAt_idx" ON "CaseQuote"("deletedAt");

-- CreateIndex
CREATE INDEX "ClientProfile_deletedAt_idx" ON "ClientProfile"("deletedAt");

-- CreateIndex
CREATE INDEX "DesignerProfile_deletedAt_idx" ON "DesignerProfile"("deletedAt");

-- CreateIndex
CREATE INDEX "Payment_deletedAt_idx" ON "Payment"("deletedAt");

-- CreateIndex
CREATE INDEX "ServiceCatalog_deletedAt_idx" ON "ServiceCatalog"("deletedAt");

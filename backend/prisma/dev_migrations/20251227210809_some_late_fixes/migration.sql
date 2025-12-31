-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_NotificationLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
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
INSERT INTO "new_NotificationLog" ("actionUrl", "body", "createdAt", "error", "errorCode", "id", "isRead", "language", "messageId", "metadata", "purpose", "readAt", "recipient", "sent", "sentAt", "subject", "templateUsed", "title", "type", "userId") SELECT "actionUrl", "body", "createdAt", "error", "errorCode", "id", "isRead", "language", "messageId", "metadata", "purpose", "readAt", "recipient", "sent", "sentAt", "subject", "templateUsed", "title", "type", "userId" FROM "NotificationLog";
DROP TABLE "NotificationLog";
ALTER TABLE "new_NotificationLog" RENAME TO "NotificationLog";
CREATE INDEX "NotificationLog_userId_type_createdAt_idx" ON "NotificationLog"("userId", "type", "createdAt");
CREATE INDEX "NotificationLog_userId_purpose_createdAt_idx" ON "NotificationLog"("userId", "purpose", "createdAt");
CREATE INDEX "NotificationLog_userId_isRead_createdAt_idx" ON "NotificationLog"("userId", "isRead", "createdAt");
CREATE INDEX "NotificationLog_sent_createdAt_idx" ON "NotificationLog"("sent", "createdAt");
CREATE INDEX "NotificationLog_createdAt_idx" ON "NotificationLog"("createdAt");
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
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Riyadh',
    "notificationPreferences" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME,
    "deletedAt" DATETIME
);
INSERT INTO "new_User" ("accountStatus", "createdAt", "deletedAt", "email", "emailVerified", "failedLoginAttempts", "id", "isLocked", "lastFailedLoginAt", "lastLoginAt", "lockReason", "lockedAt", "lockedUntil", "notificationPreferences", "phoneNumber", "phoneVerified", "preferredLanguage", "role", "timezone", "updatedAt") SELECT "accountStatus", "createdAt", "deletedAt", "email", "emailVerified", "failedLoginAttempts", "id", "isLocked", "lastFailedLoginAt", "lastLoginAt", "lockReason", "lockedAt", "lockedUntil", "notificationPreferences", "phoneNumber", "phoneVerified", "preferredLanguage", "role", "timezone", "updatedAt" FROM "User";
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

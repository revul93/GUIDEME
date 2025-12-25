/*
  Warnings:

  - You are about to drop the column `changedById` on the `CaseStatusHistory` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CaseStatusHistory" (
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
INSERT INTO "new_CaseStatusHistory" ("caseId", "changedBy", "createdAt", "fromStatus", "id", "notes", "toStatus") SELECT "caseId", "changedBy", "createdAt", "fromStatus", "id", "notes", "toStatus" FROM "CaseStatusHistory";
DROP TABLE "CaseStatusHistory";
ALTER TABLE "new_CaseStatusHistory" RENAME TO "CaseStatusHistory";
CREATE INDEX "CaseStatusHistory_caseId_createdAt_idx" ON "CaseStatusHistory"("caseId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

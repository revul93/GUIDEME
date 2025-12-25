-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CaseStatusHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "caseId" INTEGER NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedById" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CaseStatusHistory_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CaseStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "DesignerProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CaseStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "ClientProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CaseStatusHistory" ("caseId", "changedBy", "changedById", "createdAt", "fromStatus", "id", "notes", "toStatus") SELECT "caseId", "changedBy", "changedById", "createdAt", "fromStatus", "id", "notes", "toStatus" FROM "CaseStatusHistory";
DROP TABLE "CaseStatusHistory";
ALTER TABLE "new_CaseStatusHistory" RENAME TO "CaseStatusHistory";
CREATE INDEX "CaseStatusHistory_caseId_createdAt_idx" ON "CaseStatusHistory"("caseId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

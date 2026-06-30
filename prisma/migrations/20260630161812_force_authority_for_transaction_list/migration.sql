/*
  Warnings:

  - Made the column `authority` on table `TransactionList` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TransactionList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "refId" INTEGER,
    "authority" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TransactionList_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TransactionList" ("amount", "authority", "createdAt", "description", "id", "refId", "status", "type", "updatedAt", "walletId") SELECT "amount", "authority", "createdAt", "description", "id", "refId", "status", "type", "updatedAt", "walletId" FROM "TransactionList";
DROP TABLE "TransactionList";
ALTER TABLE "new_TransactionList" RENAME TO "TransactionList";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

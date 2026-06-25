/*
  Warnings:

  - You are about to drop the `_RolePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `roleId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "_RolePermission_B_index";

-- DropIndex
DROP INDEX "_RolePermission_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_RolePermission";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "UserRole" (
    "roleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("roleId", "userId"),
    CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gender" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "gender", "id", "isActive", "isDelete", "password") SELECT "createdAt", "email", "gender", "id", "isActive", "isDelete", "password" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

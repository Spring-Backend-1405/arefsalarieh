/*
  Warnings:

  - You are about to drop the column `status` on the `CourseReserves` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CourseReserves" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isConfirm" BOOLEAN NOT NULL DEFAULT false,
    "isReject" BOOLEAN NOT NULL DEFAULT false,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CourseReserves_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseReserves_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CourseReserves" ("courseId", "createdAt", "expiresAt", "id", "isConfirm", "isDelete", "isReject", "updatedAt", "userId") SELECT "courseId", "createdAt", "expiresAt", "id", "isConfirm", "isDelete", "isReject", "updatedAt", "userId" FROM "CourseReserves";
DROP TABLE "CourseReserves";
ALTER TABLE "new_CourseReserves" RENAME TO "CourseReserves";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

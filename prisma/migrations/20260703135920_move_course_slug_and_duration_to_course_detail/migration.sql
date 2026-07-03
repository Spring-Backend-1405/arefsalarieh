/*
  Warnings:

  - You are about to drop the column `duration` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Course` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `CourseDetail` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CourseDetail" ADD COLUMN "duration" TEXT;
ALTER TABLE "CourseDetail" ADD COLUMN "slug" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "teacherId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "typeId" INTEGER NOT NULL,
    CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Course_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "CourseType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Course" ("createdAt", "id", "isFree", "level", "shortDescription", "status", "teacherId", "title", "typeId", "updatedAt") SELECT "createdAt", "id", "isFree", "level", "shortDescription", "status", "teacherId", "title", "typeId", "updatedAt" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CourseDetail_slug_key" ON "CourseDetail"("slug");

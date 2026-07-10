-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CourseComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "isConfirm" BOOLEAN NOT NULL DEFAULT false,
    "isReject" BOOLEAN NOT NULL DEFAULT false,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CourseComment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CourseComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CourseComment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CourseComment" ("courseId", "createdAt", "id", "isConfirm", "isReject", "parentId", "text", "userId") SELECT "courseId", "createdAt", "id", "isConfirm", "isReject", "parentId", "text", "userId" FROM "CourseComment";
DROP TABLE "CourseComment";
ALTER TABLE "new_CourseComment" RENAME TO "CourseComment";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

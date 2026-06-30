-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserPictures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserPictures_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserPictures" ("filename", "id", "isMain", "mimetype", "path", "size", "userId") SELECT "filename", "id", "isMain", "mimetype", "path", "size", "userId" FROM "UserPictures";
DROP TABLE "UserPictures";
ALTER TABLE "new_UserPictures" RENAME TO "UserPictures";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

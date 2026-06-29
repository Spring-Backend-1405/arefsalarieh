-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "gender" TEXT,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDelete" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationTokenExpiresAt" DATETIME,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" DATETIME,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "twoFactorSecretExpiresAt" DATETIME,
    "qrCodeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "qrCodeSecret" TEXT,
    "qrCodeSecretExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "email", "gender", "id", "isActive", "isDelete", "isEmailVerified", "name", "password", "resetPasswordExpires", "resetPasswordToken", "twoFactorEnabled", "twoFactorSecret", "twoFactorSecretExpiresAt", "verificationToken", "verificationTokenExpiresAt") SELECT "createdAt", "email", "gender", "id", "isActive", "isDelete", "isEmailVerified", "name", "password", "resetPasswordExpires", "resetPasswordToken", "twoFactorEnabled", "twoFactorSecret", "twoFactorSecretExpiresAt", "verificationToken", "verificationTokenExpiresAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

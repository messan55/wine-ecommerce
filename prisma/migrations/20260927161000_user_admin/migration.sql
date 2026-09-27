-- AlterTable
ALTER TABLE "User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Le premier compte local devient admin, le temps de configurer ADMIN_EMAIL.
UPDATE "User"
SET "isAdmin" = true
WHERE id = (SELECT id FROM "User" ORDER BY "createdAt" ASC LIMIT 1);

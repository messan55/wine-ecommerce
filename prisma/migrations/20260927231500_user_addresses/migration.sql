-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT NOT NULL DEFAULT '',
    "postal" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Address_userId_idx" ON "Address"("userId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Copy the existing book address onto the new table.
INSERT INTO "Address" ("id", "userId", "name", "line1", "line2", "postal", "city", "phone", "isDefault")
SELECT
    'c' || substr(md5("id" || 'address'), 1, 24),
    "id",
    "shipName",
    "shipLine1",
    "shipLine2",
    "shipPostal",
    "shipCity",
    "shipPhone",
    true
FROM "User"
WHERE TRIM("shipLine1") <> '';

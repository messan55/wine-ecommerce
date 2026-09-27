-- CreateTable
CREATE TABLE "Wine" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "appellation" TEXT NOT NULL,
    "cepage" TEXT NOT NULL,
    "millesime" INTEGER,
    "formatLabel" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "tastingNote" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Wine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wine_slug_key" ON "Wine"("slug");

-- CreateIndex
CREATE INDEX "Wine_region_idx" ON "Wine"("region");

-- CreateIndex
CREATE INDEX "Wine_color_idx" ON "Wine"("color");

-- CreateIndex
CREATE INDEX "Wine_priceCents_idx" ON "Wine"("priceCents");

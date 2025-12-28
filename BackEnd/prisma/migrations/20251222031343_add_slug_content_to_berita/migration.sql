/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `berita` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "berita" ADD COLUMN     "content" TEXT,
ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "berita_slug_key" ON "berita"("slug");

/*
  Warnings:

  - You are about to drop the column `latitude` on the `kelompok` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `kelompok` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "kelompok" DROP COLUMN "latitude",
DROP COLUMN "longitude";

-- CreateTable
CREATE TABLE "berita" (
    "id" SERIAL NOT NULL,
    "caption" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "berita_pkey" PRIMARY KEY ("id")
);

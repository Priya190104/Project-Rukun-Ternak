/*
  Warnings:

  - You are about to drop the column `kelompok` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "kelompok" ADD COLUMN     "catatan" TEXT,
ADD COLUMN     "desa" TEXT,
ADD COLUMN     "kecamatan" TEXT;

-- AlterTable
ALTER TABLE "laporan" ADD COLUMN     "kelompok_id" INTEGER;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "kelompok",
ADD COLUMN     "kelompok_id" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_kelompok_id_fkey" FOREIGN KEY ("kelompok_id") REFERENCES "kelompok"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_kelompok_id_fkey" FOREIGN KEY ("kelompok_id") REFERENCES "kelompok"("id") ON DELETE SET NULL ON UPDATE CASCADE;

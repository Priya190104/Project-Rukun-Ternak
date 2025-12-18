-- AlterTable
ALTER TABLE "berita" ADD COLUMN     "published_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "kelompok" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

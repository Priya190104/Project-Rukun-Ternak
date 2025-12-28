-- CreateTable
CREATE TABLE "hewan_ternak" (
    "id" SERIAL NOT NULL,
    "kelompok_id" INTEGER NOT NULL,
    "jenis_kelamin" TEXT NOT NULL,
    "ras" TEXT NOT NULL,
    "tanggal_lahir" TIMESTAMP(3) NOT NULL,
    "bobot" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "id_induk" INTEGER,
    "id_pejantan" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hewan_ternak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "riwayat_bobot" (
    "id" SERIAL NOT NULL,
    "hewan_id" INTEGER NOT NULL,
    "bobot" DOUBLE PRECISION NOT NULL,
    "tanggal_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "riwayat_bobot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "update_ternak" (
    "id" SERIAL NOT NULL,
    "hewan_id" INTEGER NOT NULL,
    "kelompok_id" INTEGER NOT NULL,
    "bobot" DOUBLE PRECISION NOT NULL,
    "keterangan" TEXT,
    "tanggal_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'SELESAI',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "update_ternak_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "hewan_ternak" ADD CONSTRAINT "hewan_ternak_kelompok_id_fkey" FOREIGN KEY ("kelompok_id") REFERENCES "kelompok"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hewan_ternak" ADD CONSTRAINT "hewan_ternak_id_induk_fkey" FOREIGN KEY ("id_induk") REFERENCES "hewan_ternak"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hewan_ternak" ADD CONSTRAINT "hewan_ternak_id_pejantan_fkey" FOREIGN KEY ("id_pejantan") REFERENCES "hewan_ternak"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "riwayat_bobot" ADD CONSTRAINT "riwayat_bobot_hewan_id_fkey" FOREIGN KEY ("hewan_id") REFERENCES "hewan_ternak"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "update_ternak" ADD CONSTRAINT "update_ternak_kelompok_id_fkey" FOREIGN KEY ("kelompok_id") REFERENCES "kelompok"("id") ON DELETE CASCADE ON UPDATE CASCADE;

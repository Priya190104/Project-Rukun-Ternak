-- CreateIndex
CREATE INDEX "hewan_ternak_kelompok_id_idx" ON "hewan_ternak"("kelompok_id");

-- CreateIndex
CREATE INDEX "hewan_ternak_status_idx" ON "hewan_ternak"("status");

-- CreateIndex
CREATE INDEX "hewan_ternak_id_induk_idx" ON "hewan_ternak"("id_induk");

-- CreateIndex
CREATE INDEX "hewan_ternak_id_pejantan_idx" ON "hewan_ternak"("id_pejantan");

-- CreateIndex
CREATE INDEX "hewan_ternak_tanggal_lahir_idx" ON "hewan_ternak"("tanggal_lahir");

-- CreateIndex
CREATE INDEX "kelompok_name_idx" ON "kelompok"("name");

-- CreateIndex
CREATE INDEX "laporan_user_id_idx" ON "laporan"("user_id");

-- CreateIndex
CREATE INDEX "laporan_kelompok_id_idx" ON "laporan"("kelompok_id");

-- CreateIndex
CREATE INDEX "laporan_jenis_idx" ON "laporan"("jenis");

-- CreateIndex
CREATE INDEX "laporan_tanggal_idx" ON "laporan"("tanggal");

-- CreateIndex
CREATE INDEX "riwayat_bobot_hewan_id_idx" ON "riwayat_bobot"("hewan_id");

-- CreateIndex
CREATE INDEX "update_ternak_hewan_id_idx" ON "update_ternak"("hewan_id");

-- CreateIndex
CREATE INDEX "update_ternak_kelompok_id_idx" ON "update_ternak"("kelompok_id");

-- CreateIndex
CREATE INDEX "update_ternak_tanggal_update_idx" ON "update_ternak"("tanggal_update");

-- CreateIndex
CREATE INDEX "users_kelompok_id_idx" ON "users"("kelompok_id");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

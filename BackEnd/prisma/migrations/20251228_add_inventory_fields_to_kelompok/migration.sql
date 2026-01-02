-- Add inventory and health management fields to kelompok table
ALTER TABLE kelompok ADD COLUMN jumlah_kandang INTEGER;
ALTER TABLE kelompok ADD COLUMN jumlah_ternak INTEGER;
ALTER TABLE kelompok ADD COLUMN pakan_list JSONB;
ALTER TABLE kelompok ADD COLUMN kesehatan_list JSONB;

-- Add comments for documentation
COMMENT ON COLUMN kelompok.jumlah_kandang IS 'Jumlah kandang yang dimiliki oleh kelompok';
COMMENT ON COLUMN kelompok.jumlah_ternak IS 'Jumlah total ternak dalam semua kandang';
COMMENT ON COLUMN kelompok.pakan_list IS 'Daftar jenis pakan yang tersedia (JSON array)';
COMMENT ON COLUMN kelompok.kesehatan_list IS 'Daftar status kesehatan/perawatan ternak (JSON array)';

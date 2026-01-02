-- Remove PIC2 columns from kelompok table
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_nik;
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_nama;
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_alamat;
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_no_hp;
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_email;

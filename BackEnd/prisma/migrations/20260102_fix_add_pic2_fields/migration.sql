-- Actually remove PIC2 fields from kelompok table (they are deprecated and not used in UI)
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_nik;
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_nama;
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_alamat;
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_no_hp;
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_email;

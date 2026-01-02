-- Definitively remove PIC2 fields from kelompok table
-- These fields were deprecated and are not used in the UI
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_nik CASCADE;
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_nama CASCADE;
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_alamat CASCADE;
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_no_hp CASCADE;
ALTER TABLE kelompok DROP COLUMN IF EXISTS pic2_email CASCADE;

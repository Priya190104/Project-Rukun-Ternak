-- Change pic1_nik from VARCHAR to BIGINT
ALTER TABLE kelompok
ALTER COLUMN pic1_nik TYPE BIGINT USING (
  CASE 
    WHEN pic1_nik ~ '^\d+$' THEN pic1_nik::BIGINT
    WHEN pic1_nik IS NULL OR pic1_nik = '' THEN NULL
    ELSE NULL
  END
);

-- Change pic1_no_hp from VARCHAR to BIGINT
ALTER TABLE kelompok
ALTER COLUMN pic1_no_hp TYPE BIGINT USING (
  CASE 
    WHEN pic1_no_hp ~ '^\d+$' THEN pic1_no_hp::BIGINT
    WHEN pic1_no_hp IS NULL OR pic1_no_hp = '' THEN NULL
    ELSE NULL
  END
);

-- Fix updated_at default value for update_ternak table
-- This migration adds DEFAULT CURRENT_TIMESTAMP to updated_at column
-- which was causing "null value violates not-null constraint" error

ALTER TABLE "update_ternak" 
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

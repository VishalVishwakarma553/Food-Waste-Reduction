-- Enable PostGIS extension — MUST be the very first statement so all
-- subsequent spatial DDL succeeds in the same migration run.
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add raw float columns to User (Prisma-managed, used to receive geocoded values)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "latitude"  DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- Add the PostGIS geography column for spatial queries
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "coords" geography(Point, 4326);

-- Create a GIST index for fast ST_DWithin / ST_Distance proximity queries
CREATE INDEX IF NOT EXISTS "User_coords_gist_idx" ON "User" USING GIST ("coords");

-- ─── Trigger: keep coords in sync whenever latitude/longitude change ──────────
CREATE OR REPLACE FUNCTION sync_user_coords()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.coords = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.coords = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_user_coords ON "User";
CREATE TRIGGER trg_sync_user_coords
  BEFORE INSERT OR UPDATE OF latitude, longitude
  ON "User"
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_coords();

-- Backfill coords for any existing rows that already have lat/lng values
UPDATE "User"
SET "coords" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

-- AlterTable
ALTER TABLE "Projects" ADD COLUMN IF NOT EXISTS "images" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Backfill existing cover image into images array where empty
UPDATE "Projects"
SET "images" = ARRAY["image"]
WHERE cardinality("images") = 0
  AND "image" IS NOT NULL
  AND length(trim("image")) > 0;

ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "created_by_admin_id" TEXT;
ALTER TABLE "campaigns" ADD COLUMN IF NOT EXISTS "metadata" JSONB;

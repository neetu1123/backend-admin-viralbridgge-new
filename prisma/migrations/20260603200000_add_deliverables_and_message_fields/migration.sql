-- Message fields only (deliverables table + FKs are in init migration 20260603193000)
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'text';
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "file_url" TEXT;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "file_name" TEXT;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "file_size" TEXT;

CREATE TABLE IF NOT EXISTS "deliverables" (
  "id" TEXT NOT NULL,
  "campaign_id" TEXT NOT NULL,
  "application_id" TEXT,
  "creator_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" TEXT,
  "media_url" TEXT,
  "thumbnail_url" TEXT,
  "notes" TEXT,
  "revision_notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "due_date" TIMESTAMP(3),
  "submitted_at" TIMESTAMP(3),
  "reviewed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "deliverables_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'text';
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "file_url" TEXT;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "file_name" TEXT;
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "file_size" TEXT;

ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_campaign_id_fkey"
  FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_application_id_fkey"
  FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_creator_id_fkey"
  FOREIGN KEY ("creator_id") REFERENCES "creator_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

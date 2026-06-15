-- AlterTable
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "entity_type" TEXT;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "entity_id" TEXT;
ALTER TABLE "notifications" ALTER COLUMN "type" SET DEFAULT 'SYSTEM';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");
CREATE INDEX IF NOT EXISTS "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateTable
CREATE TABLE IF NOT EXISTS "kyc_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "remarks" TEXT,
    CONSTRAINT "kyc_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "creator_kyc" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kyc_request_id" TEXT,
    "mobile_number" TEXT,
    "mobile_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "instagram_handle" TEXT,
    "youtube_handle" TEXT,
    "tiktok_handle" TEXT,
    "instagram_profile_url" TEXT,
    "selfie_url" TEXT,
    "followers_count" INTEGER NOT NULL DEFAULT 0,
    "engagement_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verification_status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "creator_kyc_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "brand_kyc" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "kyc_request_id" TEXT,
    "company_name" TEXT,
    "gst_number" TEXT,
    "website" TEXT,
    "business_email" TEXT,
    "business_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "linkedin_url" TEXT,
    "logo_url" TEXT,
    "business_address" TEXT,
    "verification_status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "brand_kyc_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "creator_kyc_user_id_key" ON "creator_kyc"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "creator_kyc_kyc_request_id_key" ON "creator_kyc"("kyc_request_id");
CREATE UNIQUE INDEX IF NOT EXISTS "brand_kyc_user_id_key" ON "brand_kyc"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "brand_kyc_kyc_request_id_key" ON "brand_kyc"("kyc_request_id");
CREATE INDEX IF NOT EXISTS "kyc_requests_user_id_idx" ON "kyc_requests"("user_id");
CREATE INDEX IF NOT EXISTS "kyc_requests_status_idx" ON "kyc_requests"("status");

ALTER TABLE "kyc_requests" ADD CONSTRAINT "kyc_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "creator_kyc" ADD CONSTRAINT "creator_kyc_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "creator_kyc" ADD CONSTRAINT "creator_kyc_kyc_request_id_fkey" FOREIGN KEY ("kyc_request_id") REFERENCES "kyc_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "brand_kyc" ADD CONSTRAINT "brand_kyc_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "brand_kyc" ADD CONSTRAINT "brand_kyc_kyc_request_id_fkey" FOREIGN KEY ("kyc_request_id") REFERENCES "kyc_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

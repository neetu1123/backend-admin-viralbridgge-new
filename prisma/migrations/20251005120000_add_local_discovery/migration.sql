-- Safe additive discovery fields on existing profiles
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "cover_image" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "subcategory" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "area" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "review_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "discovery_status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "is_phone_public" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "is_email_public" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;
ALTER TABLE "creator_profiles" ADD COLUMN IF NOT EXISTS "is_whatsapp_public" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "cover_image" TEXT;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "short_description" TEXT;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "subcategory" TEXT;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "services" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "area" TEXT;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "business_hours" JSONB;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "established_year" INTEGER;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "review_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "discovery_status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "is_phone_public" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "is_email_public" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "is_whatsapp_public" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "is_address_public" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "brand_profiles" ADD COLUMN IF NOT EXISTS "social_links" JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS "creator_profiles_slug_key" ON "creator_profiles"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "brand_profiles_slug_key" ON "brand_profiles"("slug");
CREATE INDEX IF NOT EXISTS "creator_profiles_city_idx" ON "creator_profiles"("city");
CREATE INDEX IF NOT EXISTS "creator_profiles_discovery_status_featured_idx" ON "creator_profiles"("discovery_status", "featured");
CREATE INDEX IF NOT EXISTS "brand_profiles_city_idx" ON "brand_profiles"("city");
CREATE INDEX IF NOT EXISTS "brand_profiles_category_idx" ON "brand_profiles"("category");
CREATE INDEX IF NOT EXISTS "brand_profiles_discovery_status_featured_idx" ON "brand_profiles"("discovery_status", "featured");
CREATE INDEX IF NOT EXISTS "creator_profiles_area_idx" ON "creator_profiles"("area");
CREATE INDEX IF NOT EXISTS "creator_profiles_full_name_idx" ON "creator_profiles"("full_name");
CREATE INDEX IF NOT EXISTS "brand_profiles_area_idx" ON "brand_profiles"("area");
CREATE INDEX IF NOT EXISTS "brand_profiles_company_name_idx" ON "brand_profiles"("company_name");
CREATE INDEX IF NOT EXISTS "brand_profiles_state_idx" ON "brand_profiles"("state");
CREATE INDEX IF NOT EXISTS "creator_profiles_state_idx" ON "creator_profiles"("state");

CREATE TABLE IF NOT EXISTS "discovery_categories" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "icon" TEXT,
  "type" TEXT NOT NULL DEFAULT 'BOTH',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "discovery_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "discovery_categories_slug_key" ON "discovery_categories"("slug");
CREATE INDEX IF NOT EXISTS "discovery_categories_status_type_idx" ON "discovery_categories"("status", "type");

CREATE TABLE IF NOT EXISTS "discovery_enquiries" (
  "id" TEXT NOT NULL,
  "listing_type" TEXT NOT NULL,
  "brand_id" TEXT,
  "creator_id" TEXT,
  "sender_user_id" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "discovery_enquiries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "discovery_enquiries_brand_id_created_at_idx" ON "discovery_enquiries"("brand_id", "created_at");
CREATE INDEX IF NOT EXISTS "discovery_enquiries_creator_id_created_at_idx" ON "discovery_enquiries"("creator_id", "created_at");
CREATE INDEX IF NOT EXISTS "discovery_enquiries_email_created_at_idx" ON "discovery_enquiries"("email", "created_at");

CREATE TABLE IF NOT EXISTS "discovery_events" (
  "id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "listing_type" TEXT,
  "listing_id" TEXT,
  "category" TEXT,
  "city" TEXT,
  "query" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "discovery_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "discovery_events_event_type_created_at_idx" ON "discovery_events"("event_type", "created_at");
CREATE INDEX IF NOT EXISTS "discovery_events_listing_id_event_type_idx" ON "discovery_events"("listing_id", "event_type");

DO $$ BEGIN
  ALTER TABLE "discovery_enquiries" ADD CONSTRAINT "discovery_enquiries_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brand_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "discovery_enquiries" ADD CONSTRAINT "discovery_enquiries_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creator_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "discovery_enquiries" ADD CONSTRAINT "discovery_enquiries_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

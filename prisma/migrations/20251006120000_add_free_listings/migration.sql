-- CreateTable
CREATE TABLE "free_listings" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "cover_image_url" TEXT,
    "short_description" TEXT,
    "description" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "website" TEXT,
    "city" TEXT,
    "state" TEXT,
    "area" TEXT,
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "business_hours" JSONB,
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "social_links" JSONB,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "portfolio" JSONB,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_phone_public" BOOLEAN NOT NULL DEFAULT false,
    "is_email_public" BOOLEAN NOT NULL DEFAULT false,
    "is_whatsapp_public" BOOLEAN NOT NULL DEFAULT true,
    "is_address_public" BOOLEAN NOT NULL DEFAULT false,
    "is_website_public" BOOLEAN NOT NULL DEFAULT true,
    "profile_views" INTEGER NOT NULL DEFAULT 0,
    "rejection_reason" TEXT,
    "published_at" TIMESTAMP(3),
    "brand_profile_id" TEXT,
    "creator_profile_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "free_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "free_listing_enquiries" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "sender_user_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "free_listing_enquiries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "free_listing_reports" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT,
    "target_id" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "free_listing_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "free_listings_slug_key" ON "free_listings"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "free_listings_owner_user_id_key" ON "free_listings"("owner_user_id");

-- CreateIndex
CREATE INDEX "free_listings_status_is_visible_type_idx" ON "free_listings"("status", "is_visible", "type");

-- CreateIndex
CREATE INDEX "free_listings_city_category_idx" ON "free_listings"("city", "category");

-- CreateIndex
CREATE INDEX "free_listings_slug_idx" ON "free_listings"("slug");

-- CreateIndex
CREATE INDEX "free_listing_enquiries_listing_id_created_at_idx" ON "free_listing_enquiries"("listing_id", "created_at");

-- CreateIndex
CREATE INDEX "free_listing_enquiries_email_created_at_idx" ON "free_listing_enquiries"("email", "created_at");

-- CreateIndex
CREATE INDEX "free_listing_reports_status_created_at_idx" ON "free_listing_reports"("status", "created_at");

-- CreateIndex
CREATE INDEX "free_listing_reports_target_id_idx" ON "free_listing_reports"("target_id");

-- AddForeignKey
ALTER TABLE "free_listings" ADD CONSTRAINT "free_listings_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "free_listing_enquiries" ADD CONSTRAINT "free_listing_enquiries_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "free_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "free_listing_enquiries" ADD CONSTRAINT "free_listing_enquiries_sender_user_id_fkey" FOREIGN KEY ("sender_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "free_listing_reports" ADD CONSTRAINT "free_listing_reports_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "free_listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

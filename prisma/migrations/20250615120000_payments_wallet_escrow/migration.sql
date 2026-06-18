-- Escrow: add released_at
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "released_at" TIMESTAMP(3);

-- Disputes: add raised_by, resolution_notes, updated_at
ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "raised_by" TEXT NOT NULL DEFAULT 'brand';
ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "resolution_notes" TEXT;
ALTER TABLE "disputes" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Payment orders for Razorpay
CREATE TABLE IF NOT EXISTS "payment_orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "razorpay_order_id" TEXT NOT NULL,
    "razorpay_payment_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'CREATED',
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payment_orders_razorpay_order_id_key" ON "payment_orders"("razorpay_order_id");
CREATE INDEX IF NOT EXISTS "payment_orders_user_id_status_idx" ON "payment_orders"("user_id", "status");
CREATE INDEX IF NOT EXISTS "escrows_campaign_id_creator_id_brand_id_idx" ON "escrows"("campaign_id", "creator_id", "brand_id");
CREATE INDEX IF NOT EXISTS "disputes_campaign_id_creator_id_status_idx" ON "disputes"("campaign_id", "creator_id", "status");

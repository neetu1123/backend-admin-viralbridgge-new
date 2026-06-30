-- Missing from platform_managed_escrow migration; required by Prisma Escrow model
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "refunded_at" TIMESTAMP(3);

-- Ensure other escrow columns exist (safe if already applied)
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "platform_fee_percent" DOUBLE PRECISION NOT NULL DEFAULT 10;
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "platform_fee_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "creator_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "payment_gateway" TEXT;
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "payment_id" TEXT;
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "funded_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "platform_settings" ADD COLUMN IF NOT EXISTS "platform_fee_percent" DOUBLE PRECISION NOT NULL DEFAULT 10;

-- Platform-managed escrow: wallet enhancements, wallet_transactions, escrow fields

ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "locked_balance" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "lifetime_earnings" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'INR';
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "is_platform" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "wallets" ADD COLUMN IF NOT EXISTS "is_frozen" BOOLEAN NOT NULL DEFAULT false;

UPDATE "wallets" SET "locked_balance" = "pending_balance" WHERE "locked_balance" = 0 AND "pending_balance" > 0;

-- Migrate transactions -> wallet_transactions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions') THEN
    ALTER TABLE "transactions" RENAME TO "wallet_transactions";
  END IF;
END $$;

ALTER TABLE "wallet_transactions" ADD COLUMN IF NOT EXISTS "balance_after" DOUBLE PRECISION;
ALTER TABLE "wallet_transactions" ADD COLUMN IF NOT EXISTS "reference_type" TEXT;

ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "platform_fee_percent" DOUBLE PRECISION NOT NULL DEFAULT 10;
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "platform_fee_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "creator_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "payment_gateway" TEXT;
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "payment_id" TEXT;
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "funded_at" TIMESTAMP(3);

UPDATE "escrows" SET "funded_at" = "locked_at" WHERE "funded_at" IS NULL AND "locked_at" IS NOT NULL;
UPDATE "escrows" SET "platform_fee_amount" = COALESCE("platform_fee", 0) WHERE "platform_fee_amount" = 0;
UPDATE "escrows" SET "creator_amount" = GREATEST(0, "amount" - COALESCE("platform_fee", 0)) WHERE "creator_amount" = 0;

ALTER TABLE "payment_orders" ADD COLUMN IF NOT EXISTS "escrow_id" TEXT;
ALTER TABLE "payment_orders" ADD COLUMN IF NOT EXISTS "purpose" TEXT NOT NULL DEFAULT 'WALLET_TOPUP';

CREATE TABLE IF NOT EXISTS "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "push_enabled" BOOLEAN NOT NULL DEFAULT true,
    "payment_alerts" BOOLEAN NOT NULL DEFAULT true,
    "campaign_alerts" BOOLEAN NOT NULL DEFAULT true,
    "marketing_emails" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'notification_preferences_user_id_fkey'
  ) THEN
    ALTER TABLE "notification_preferences"
      ADD CONSTRAINT "notification_preferences_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_orders_escrow_id_fkey'
  ) THEN
    ALTER TABLE "payment_orders"
      ADD CONSTRAINT "payment_orders_escrow_id_fkey"
      FOREIGN KEY ("escrow_id") REFERENCES "escrows"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "wallet_transactions_wallet_id_created_at_idx" ON "wallet_transactions"("wallet_id", "created_at");
CREATE INDEX IF NOT EXISTS "wallet_transactions_reference_type_reference_id_idx" ON "wallet_transactions"("reference_type", "reference_id");
CREATE INDEX IF NOT EXISTS "payment_orders_escrow_id_idx" ON "payment_orders"("escrow_id");

-- Escrow payment flow: PENDING status, platform fee, locked_at
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "platform_fee" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "escrows" ADD COLUMN IF NOT EXISTS "locked_at" TIMESTAMP(3);

-- Deliverables: file_url, version, auto_release_at
ALTER TABLE "deliverables" ADD COLUMN IF NOT EXISTS "file_url" TEXT;
ALTER TABLE "deliverables" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "deliverables" ADD COLUMN IF NOT EXISTS "auto_release_at" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "deliverables_campaign_id_status_idx" ON "deliverables"("campaign_id", "status");
CREATE INDEX IF NOT EXISTS "deliverables_status_auto_release_at_idx" ON "deliverables"("status", "auto_release_at");
CREATE INDEX IF NOT EXISTS "escrows_status_idx" ON "escrows"("status");

-- Withdrawals table
CREATE TABLE IF NOT EXISTS "withdrawals" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transaction_id" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "withdrawals_transaction_id_key" ON "withdrawals"("transaction_id");
CREATE INDEX IF NOT EXISTS "withdrawals_creator_id_status_idx" ON "withdrawals"("creator_id", "status");

ALTER TABLE "withdrawals" DROP CONSTRAINT IF EXISTS "withdrawals_creator_id_fkey";
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_creator_id_fkey"
    FOREIGN KEY ("creator_id") REFERENCES "creator_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

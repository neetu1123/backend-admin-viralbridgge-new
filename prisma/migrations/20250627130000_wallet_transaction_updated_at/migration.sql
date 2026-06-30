-- wallet_transactions retained updated_at from legacy "transactions" table.
-- Prisma must populate it on insert; add a DB default for safety.

ALTER TABLE "wallet_transactions"
  ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

UPDATE "wallet_transactions"
  SET "updated_at" = COALESCE("updated_at", "created_at", CURRENT_TIMESTAMP)
  WHERE "updated_at" IS NULL;

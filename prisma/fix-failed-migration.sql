-- Run once in Neon: SQL Editor → paste → Run
-- Fixes P3009 after migration 20260603200000 failed on deploy.
-- Schema is already correct (init migration created deliverables + FKs).

UPDATE "_prisma_migrations"
SET
  "finished_at" = NOW(),
  "logs" = NULL,
  "rolled_back_at" = NULL
WHERE "migration_name" = '20260603200000_add_deliverables_and_message_fields'
  AND "finished_at" IS NULL;

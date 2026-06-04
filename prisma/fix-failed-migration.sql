-- Run in Neon → SQL Editor (same database as Vercel DATABASE_URL)
-- Fixes P3009: marks the failed migration as successfully completed.

UPDATE "_prisma_migrations"
SET
  "finished_at" = NOW(),
  "logs" = NULL,
  "rolled_back_at" = NULL,
  "applied_steps_count" = GREATEST("applied_steps_count", 1)
WHERE "migration_name" = '20260603200000_add_deliverables_and_message_fields';

-- Verify (should show finished_at filled in, logs null):
SELECT "migration_name", "started_at", "finished_at", LEFT("logs", 80) AS logs_preview
FROM "_prisma_migrations"
ORDER BY "started_at";

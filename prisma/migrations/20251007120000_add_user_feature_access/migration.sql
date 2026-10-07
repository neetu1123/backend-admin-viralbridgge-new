-- Limited Brand/Creator accounts stay on listing + grow-business until admin grants FULL.
ALTER TABLE "users" ADD COLUMN "feature_access" TEXT NOT NULL DEFAULT 'LIMITED';
ALTER TABLE "users" ADD COLUMN "access_requested_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "access_granted_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "access_granted_by" TEXT;

-- Keep existing Brand/Creator campaign tools unlocked.
UPDATE "users" SET "feature_access" = 'FULL', "access_granted_at" = CURRENT_TIMESTAMP;

-- Dismissible in-app banners (invite / approach) without removing inbox items
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "is_dismissed" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "notifications_user_id_is_dismissed_idx" ON "notifications"("user_id", "is_dismissed");

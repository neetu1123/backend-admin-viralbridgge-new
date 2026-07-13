-- User activity tracking
CREATE TABLE "user_activity" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "last_login" TIMESTAMP(3),
    "last_active" TIMESTAMP(3),
    "last_campaign_activity" TIMESTAMP(3),
    "last_wallet_activity" TIMESTAMP(3),
    "last_message_activity" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_activity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_activity_user_id_key" ON "user_activity"("user_id");
CREATE INDEX "user_activity_last_active_idx" ON "user_activity"("last_active");

ALTER TABLE "user_activity" ADD CONSTRAINT "user_activity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Campaign prompt events
CREATE TABLE "campaign_prompt_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_prompt_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "campaign_prompt_events_user_id_event_type_idx" ON "campaign_prompt_events"("user_id", "event_type");
CREATE INDEX "campaign_prompt_events_user_id_created_at_idx" ON "campaign_prompt_events"("user_id", "created_at");

ALTER TABLE "campaign_prompt_events" ADD CONSTRAINT "campaign_prompt_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Re-engagement email logs
CREATE TABLE "re_engagement_email_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_type" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "resend_id" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "opened_at" TIMESTAMP(3),
    "returned_at" TIMESTAMP(3),

    CONSTRAINT "re_engagement_email_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "re_engagement_email_logs_user_id_sent_at_idx" ON "re_engagement_email_logs"("user_id", "sent_at");
CREATE INDEX "re_engagement_email_logs_sent_at_idx" ON "re_engagement_email_logs"("sent_at");

ALTER TABLE "re_engagement_email_logs" ADD CONSTRAINT "re_engagement_email_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Platform settings: re-engagement config
ALTER TABLE "platform_settings" ADD COLUMN IF NOT EXISTS "reengagement_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "platform_settings" ADD COLUMN IF NOT EXISTS "reengagement_inactive_period" TEXT NOT NULL DEFAULT '7d';
ALTER TABLE "platform_settings" ADD COLUMN IF NOT EXISTS "reengagement_email_frequency_days" INTEGER NOT NULL DEFAULT 7;

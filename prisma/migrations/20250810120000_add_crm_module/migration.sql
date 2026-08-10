-- CRM Module

CREATE TABLE "crm_leads" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "profile_photo" TEXT,
    "gender" TEXT,
    "date_of_birth" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "alternate_phone" TEXT,
    "whatsapp" TEXT,
    "website" TEXT,
    "company" TEXT NOT NULL,
    "job_title" TEXT,
    "industry" TEXT,
    "company_size" TEXT,
    "gst_number" TEXT,
    "country" TEXT,
    "state" TEXT,
    "city" TEXT,
    "postal_code" TEXT,
    "address" TEXT,
    "lead_type" TEXT NOT NULL,
    "lead_source" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "lead_status" TEXT NOT NULL DEFAULT 'New',
    "assigned_to_id" TEXT,
    "created_by_id" TEXT,
    "deal_currency" TEXT NOT NULL DEFAULT 'INR',
    "deal_value" DOUBLE PRECISION,
    "next_follow_up_date" TEXT,
    "next_follow_up_time" TEXT,
    "description" TEXT,
    "internal_notes" TEXT,
    "tags" TEXT[],
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_notes" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_follow_ups" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_follow_ups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_timeline_events" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_timeline_events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm_attachments" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_attachments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "crm_leads_lead_status_idx" ON "crm_leads"("lead_status");
CREATE INDEX "crm_leads_assigned_to_id_idx" ON "crm_leads"("assigned_to_id");
CREATE INDEX "crm_leads_created_at_idx" ON "crm_leads"("created_at");

ALTER TABLE "crm_leads" ADD CONSTRAINT "crm_leads_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crm_leads" ADD CONSTRAINT "crm_leads_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "crm_notes" ADD CONSTRAINT "crm_notes_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm_follow_ups" ADD CONSTRAINT "crm_follow_ups_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm_timeline_events" ADD CONSTRAINT "crm_timeline_events_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm_attachments" ADD CONSTRAINT "crm_attachments_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CRM enhancements: agents, assignment history, import/export jobs

CREATE TABLE IF NOT EXISTS "crm_agents" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "last_activity" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "crm_agents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "crm_agents_user_id_key" ON "crm_agents"("user_id");

CREATE TABLE IF NOT EXISTS "crm_lead_assignments" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT NOT NULL,
    "previous_agent_id" TEXT,
    "new_agent_id" TEXT,
    "assigned_by_id" TEXT,
    "reason" TEXT,
    "assignment_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crm_lead_assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "crm_lead_assignments_lead_id_idx" ON "crm_lead_assignments"("lead_id");

CREATE TABLE IF NOT EXISTS "crm_import_jobs" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "uploaded_by_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "successful_rows" INTEGER NOT NULL DEFAULT 0,
    "duplicate_rows" INTEGER NOT NULL DEFAULT 0,
    "failed_rows" INTEGER NOT NULL DEFAULT 0,
    "warning_rows" INTEGER NOT NULL DEFAULT 0,
    "duplicate_strategy" TEXT NOT NULL DEFAULT 'SKIP',
    "preview_json" JSONB,
    "file_url" TEXT,
    "error_file_url" TEXT,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "crm_import_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "crm_import_jobs_uploaded_by_id_idx" ON "crm_import_jobs"("uploaded_by_id");

CREATE TABLE IF NOT EXISTS "crm_import_errors" (
    "id" TEXT NOT NULL,
    "import_job_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "row_data" JSONB,
    "error" TEXT NOT NULL,
    "suggested_fix" TEXT,
    CONSTRAINT "crm_import_errors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "crm_export_jobs" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "requested_by_id" TEXT NOT NULL,
    "filters_json" JSONB,
    "selected_fields" JSONB,
    "record_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "file_content" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    CONSTRAINT "crm_export_jobs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "crm_export_jobs_requested_by_id_idx" ON "crm_export_jobs"("requested_by_id");

ALTER TABLE "crm_agents" ADD CONSTRAINT "crm_agents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm_lead_assignments" ADD CONSTRAINT "crm_lead_assignments_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "crm_leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm_lead_assignments" ADD CONSTRAINT "crm_lead_assignments_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "crm_import_jobs" ADD CONSTRAINT "crm_import_jobs_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm_import_errors" ADD CONSTRAINT "crm_import_errors_import_job_id_fkey" FOREIGN KEY ("import_job_id") REFERENCES "crm_import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm_export_jobs" ADD CONSTRAINT "crm_export_jobs_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

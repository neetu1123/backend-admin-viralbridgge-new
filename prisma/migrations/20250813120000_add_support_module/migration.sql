-- Support System Module

CREATE TABLE "support_categories" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_subcategories" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_subcategories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_issues" (
    "id" TEXT NOT NULL,
    "subcategory_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "keywords" TEXT[],
    "solution" TEXT,
    "action_type" TEXT,
    "action_url" TEXT,
    "requires_admin" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "case_type" TEXT NOT NULL DEFAULT 'GENERAL_SUPPORT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_issues_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_cases" (
    "id" TEXT NOT NULL,
    "case_number" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_role" TEXT NOT NULL,
    "category_id" TEXT,
    "subcategory_id" TEXT,
    "issue_id" TEXT,
    "case_type" TEXT NOT NULL DEFAULT 'GENERAL_SUPPORT',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "campaign_id" TEXT,
    "payment_id" TEXT,
    "transaction_id" TEXT,
    "context_json" JSONB,
    "assigned_admin_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "support_cases_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_case_messages" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "support_case_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_case_attachments" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "mime_type" TEXT,
    "file_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_case_attachments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_case_notes" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_case_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "support_case_events" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "actor_id" TEXT,
    "event_type" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "support_case_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "support_categories_role_slug_key" ON "support_categories"("role", "slug");
CREATE UNIQUE INDEX "support_subcategories_category_id_slug_key" ON "support_subcategories"("category_id", "slug");
CREATE UNIQUE INDEX "support_issues_subcategory_id_slug_key" ON "support_issues"("subcategory_id", "slug");
CREATE UNIQUE INDEX "support_cases_case_number_key" ON "support_cases"("case_number");
CREATE INDEX "support_cases_user_id_idx" ON "support_cases"("user_id");
CREATE INDEX "support_cases_status_idx" ON "support_cases"("status");
CREATE INDEX "support_cases_assigned_admin_id_idx" ON "support_cases"("assigned_admin_id");
CREATE INDEX "support_case_messages_case_id_idx" ON "support_case_messages"("case_id");
CREATE INDEX "support_case_events_case_id_idx" ON "support_case_events"("case_id");

ALTER TABLE "support_subcategories" ADD CONSTRAINT "support_subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "support_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_issues" ADD CONSTRAINT "support_issues_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "support_subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_cases" ADD CONSTRAINT "support_cases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "support_cases" ADD CONSTRAINT "support_cases_assigned_admin_id_fkey" FOREIGN KEY ("assigned_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "support_case_messages" ADD CONSTRAINT "support_case_messages_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "support_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_case_messages" ADD CONSTRAINT "support_case_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "support_case_attachments" ADD CONSTRAINT "support_case_attachments_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "support_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_case_notes" ADD CONSTRAINT "support_case_notes_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "support_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "support_case_notes" ADD CONSTRAINT "support_case_notes_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "support_case_events" ADD CONSTRAINT "support_case_events_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "support_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

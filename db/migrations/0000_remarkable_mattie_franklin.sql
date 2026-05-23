CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete', 'approve', 'reject', 'login', 'logout');--> statement-breakpoint
CREATE TYPE "public"."blotter_status" AS ENUM('filed', 'under_mediation', 'settled', 'escalated', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."civil_status" AS ENUM('single', 'married', 'widowed', 'separated', 'annulled');--> statement-breakpoint
CREATE TYPE "public"."department_type" AS ENUM('treasury', 'health', 'agriculture', 'engineering', 'social_welfare', 'civil_registry', 'budget', 'accounting', 'assessor', 'hr', 'planning', 'mayor_office', 'vice_mayor_office', 'sb_office');--> statement-breakpoint
CREATE TYPE "public"."doc_status" AS ENUM('pending', 'approved', 'rejected', 'released');--> statement-breakpoint
CREATE TYPE "public"."doc_type" AS ENUM('barangay_clearance', 'certificate_of_residency', 'certificate_of_indigency', 'barangay_id', 'business_clearance', 'good_moral_certificate');--> statement-breakpoint
CREATE TYPE "public"."financial_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."official_position" AS ENUM('punong_barangay', 'kagawad', 'sk_chairperson', 'sk_kagawad', 'barangay_secretary', 'barangay_treasurer', 'tanod');--> statement-breakpoint
CREATE TYPE "public"."program_type" AS ENUM('4ps', 'senior_citizen', 'pwd', 'solo_parent', 'indigent');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('super_admin', 'barangay_admin', 'resident', 'department_admin');--> statement-breakpoint
CREATE TYPE "public"."sex" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"posted_by_id" uuid NOT NULL,
	"barangay_id" uuid,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"barangay_id" uuid,
	"action" "audit_action" NOT NULL,
	"table_name" varchar(60) NOT NULL,
	"record_id" uuid,
	"previous_value" jsonb,
	"new_value" jsonb,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "barangay_officials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barangay_id" uuid NOT NULL,
	"resident_id" uuid,
	"position" "official_position" NOT NULL,
	"term_start" date NOT NULL,
	"term_end" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"signature" varchar(300),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "barangays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"municipality" varchar(100) NOT NULL,
	"province" varchar(100) NOT NULL,
	"region" varchar(100) NOT NULL,
	"zip_code" varchar(10),
	"contact_number" varchar(20),
	"email" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blotter_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barangay_id" uuid NOT NULL,
	"case_number" varchar(30) NOT NULL,
	"filed_by_id" uuid NOT NULL,
	"complainant_id" uuid,
	"complainant_name" varchar(150),
	"respondent_id" uuid,
	"respondent_name" varchar(150),
	"incident_date" date NOT NULL,
	"incident_location" varchar(200),
	"narrative" text NOT NULL,
	"status" "blotter_status" DEFAULT 'filed' NOT NULL,
	"resolved_at" timestamp,
	"resolution" text,
	"is_escalated" boolean DEFAULT false NOT NULL,
	"escalated_at" timestamp,
	"escalation_reason" text,
	"assigned_official_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "blotter_cases_case_number_unique" UNIQUE("case_number")
);
--> statement-breakpoint
CREATE TABLE "blotter_proceedings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"case_id" uuid NOT NULL,
	"recorded_by_id" uuid NOT NULL,
	"proceeding_date" date NOT NULL,
	"notes" text NOT NULL,
	"next_hearing_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barangay_id" uuid NOT NULL,
	"type" "department_type" NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "document_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barangay_id" uuid NOT NULL,
	"resident_id" uuid NOT NULL,
	"requested_by_id" uuid NOT NULL,
	"doc_type" "doc_type" NOT NULL,
	"purpose" text NOT NULL,
	"status" "doc_status" DEFAULT 'pending' NOT NULL,
	"processed_by_id" uuid,
	"processed_at" timestamp,
	"rejection_reason" text,
	"released_at" timestamp,
	"or_number" varchar(50),
	"document_path" varchar(300),
	"control_number" varchar(30),
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "document_requests_control_number_unique" UNIQUE("control_number")
);
--> statement-breakpoint
CREATE TABLE "financial_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barangay_id" uuid NOT NULL,
	"recorded_by_id" uuid NOT NULL,
	"type" "financial_type" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text,
	"reference_number" varchar(60),
	"transaction_date" date NOT NULL,
	"fiscal_year" integer NOT NULL,
	"quarter" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "households" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barangay_id" uuid NOT NULL,
	"house_number" varchar(20),
	"street_purok" varchar(100),
	"head_resident_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"related_table" varchar(60),
	"related_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_beneficiaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"resident_id" uuid NOT NULL,
	"enrolled_at" date NOT NULL,
	"removed_at" date,
	"removal_reason" text,
	"remarks" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"barangay_id" uuid NOT NULL,
	"type" "program_type" NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "residents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"barangay_id" uuid NOT NULL,
	"household_id" uuid,
	"first_name" varchar(60) NOT NULL,
	"middle_name" varchar(60),
	"last_name" varchar(60) NOT NULL,
	"suffix" varchar(10),
	"sex" "sex" NOT NULL,
	"birth_date" date NOT NULL,
	"birth_place" varchar(100),
	"civil_status" "civil_status" NOT NULL,
	"nationality" varchar(60) DEFAULT 'Filipino',
	"religion" varchar(60),
	"occupation" varchar(100),
	"contact_number" varchar(20),
	"email" varchar(100),
	"is_registered_voter" boolean DEFAULT false,
	"voter_id_number" varchar(50),
	"is_indigenous_people" boolean DEFAULT false,
	"is_senior_citizen" boolean DEFAULT false,
	"is_pwd" boolean DEFAULT false,
	"pwd_type" varchar(60),
	"is_solo_parent" boolean DEFAULT false,
	"pending_profile_update" jsonb,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "residents_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" uuid NOT NULL,
	"role" "role" NOT NULL,
	"barangay_id" uuid,
	"department_id" uuid,
	"first_name" varchar(60) NOT NULL,
	"middle_name" varchar(60),
	"last_name" varchar(60) NOT NULL,
	"suffix" varchar(10),
	"email" varchar(100),
	"phone_number" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_auth_id_unique" UNIQUE("auth_id")
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_posted_by_id_users_id_fk" FOREIGN KEY ("posted_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_barangay_id_barangays_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."barangays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_barangay_id_barangays_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."barangays"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barangay_officials" ADD CONSTRAINT "barangay_officials_barangay_id_barangays_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."barangays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "barangay_officials" ADD CONSTRAINT "barangay_officials_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blotter_cases" ADD CONSTRAINT "blotter_cases_barangay_id_barangays_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."barangays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blotter_cases" ADD CONSTRAINT "blotter_cases_filed_by_id_users_id_fk" FOREIGN KEY ("filed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blotter_cases" ADD CONSTRAINT "blotter_cases_complainant_id_residents_id_fk" FOREIGN KEY ("complainant_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blotter_cases" ADD CONSTRAINT "blotter_cases_respondent_id_residents_id_fk" FOREIGN KEY ("respondent_id") REFERENCES "public"."residents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blotter_cases" ADD CONSTRAINT "blotter_cases_assigned_official_id_barangay_officials_id_fk" FOREIGN KEY ("assigned_official_id") REFERENCES "public"."barangay_officials"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blotter_proceedings" ADD CONSTRAINT "blotter_proceedings_case_id_blotter_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."blotter_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blotter_proceedings" ADD CONSTRAINT "blotter_proceedings_recorded_by_id_users_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_barangay_id_barangays_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."barangays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_barangay_id_barangays_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."barangays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_requested_by_id_users_id_fk" FOREIGN KEY ("requested_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_requests" ADD CONSTRAINT "document_requests_processed_by_id_users_id_fk" FOREIGN KEY ("processed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_records" ADD CONSTRAINT "financial_records_barangay_id_barangays_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."barangays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "financial_records" ADD CONSTRAINT "financial_records_recorded_by_id_users_id_fk" FOREIGN KEY ("recorded_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "households" ADD CONSTRAINT "households_barangay_id_barangays_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."barangays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_beneficiaries" ADD CONSTRAINT "program_beneficiaries_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_beneficiaries" ADD CONSTRAINT "program_beneficiaries_resident_id_residents_id_fk" FOREIGN KEY ("resident_id") REFERENCES "public"."residents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_barangay_id_barangays_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."barangays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residents" ADD CONSTRAINT "residents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residents" ADD CONSTRAINT "residents_barangay_id_barangays_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."barangays"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "residents" ADD CONSTRAINT "residents_household_id_households_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."households"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_barangay_id_barangays_id_fk" FOREIGN KEY ("barangay_id") REFERENCES "public"."barangays"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcements_barangay_idx" ON "announcements" USING btree ("barangay_id");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_barangay_idx" ON "audit_logs" USING btree ("barangay_id");--> statement-breakpoint
CREATE INDEX "audit_table_idx" ON "audit_logs" USING btree ("table_name","record_id");--> statement-breakpoint
CREATE INDEX "officials_barangay_idx" ON "barangay_officials" USING btree ("barangay_id");--> statement-breakpoint
CREATE INDEX "officials_active_idx" ON "barangay_officials" USING btree ("barangay_id","is_active");--> statement-breakpoint
CREATE INDEX "blotter_barangay_idx" ON "blotter_cases" USING btree ("barangay_id");--> statement-breakpoint
CREATE INDEX "blotter_status_idx" ON "blotter_cases" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "blotter_case_number_idx" ON "blotter_cases" USING btree ("case_number");--> statement-breakpoint
CREATE INDEX "proceedings_case_idx" ON "blotter_proceedings" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "departments_barangay_idx" ON "departments" USING btree ("barangay_id");--> statement-breakpoint
CREATE INDEX "departments_type_idx" ON "departments" USING btree ("barangay_id","type");--> statement-breakpoint
CREATE INDEX "doc_requests_barangay_idx" ON "document_requests" USING btree ("barangay_id");--> statement-breakpoint
CREATE INDEX "doc_requests_resident_idx" ON "document_requests" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "doc_requests_status_idx" ON "document_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "financials_barangay_idx" ON "financial_records" USING btree ("barangay_id");--> statement-breakpoint
CREATE INDEX "financials_fiscal_idx" ON "financial_records" USING btree ("barangay_id","fiscal_year");--> statement-breakpoint
CREATE INDEX "households_barangay_idx" ON "households" USING btree ("barangay_id");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_unread_idx" ON "notifications" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "beneficiaries_program_idx" ON "program_beneficiaries" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "beneficiaries_resident_idx" ON "program_beneficiaries" USING btree ("resident_id");--> statement-breakpoint
CREATE INDEX "programs_barangay_idx" ON "programs" USING btree ("barangay_id");--> statement-breakpoint
CREATE INDEX "residents_barangay_idx" ON "residents" USING btree ("barangay_id");--> statement-breakpoint
CREATE INDEX "residents_household_idx" ON "residents" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "residents_name_idx" ON "residents" USING btree ("last_name","first_name");--> statement-breakpoint
CREATE UNIQUE INDEX "users_auth_id_idx" ON "users" USING btree ("auth_id");--> statement-breakpoint
CREATE INDEX "users_barangay_idx" ON "users" USING btree ("barangay_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_department_idx" ON "users" USING btree ("department_id");
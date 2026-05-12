import {
  pgTable,
  uuid,
  text,
  varchar,
  boolean,
  timestamp,
  date,
  integer,
  numeric,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {
  roleEnum,
  docTypeEnum,
  docStatusEnum,
  blotterStatusEnum,
  civilStatusEnum,
  sexEnum,
  officialPositionEnum,
  programTypeEnum,
  auditActionEnum,
  financialTypeEnum,
} from "./enums";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
};

// ---------------------------------------------------------------------------
// Barangays
// ---------------------------------------------------------------------------

export const barangays = pgTable("barangays", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  municipality: varchar("municipality", { length: 100 }).notNull(),
  province: varchar("province", { length: 100 }).notNull(),
  region: varchar("region", { length: 100 }).notNull(),
  zipCode: varchar("zip_code", { length: 10 }),
  contactNumber: varchar("contact_number", { length: 20 }),
  email: varchar("email", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Users  (mirrors Supabase auth.users via auth_id)
// ---------------------------------------------------------------------------

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authId: uuid("auth_id").notNull().unique(), // Supabase auth.users.id
    role: roleEnum("role").notNull(),
    barangayId: uuid("barangay_id").references(() => barangays.id, {
      onDelete: "set null",
    }),
    // Super-admins: barangayId = null
    // Barangay admins: scoped to one barangay
    // Residents: scoped to one barangay (their registered barangay)
    firstName: varchar("first_name", { length: 60 }).notNull(),
    middleName: varchar("middle_name", { length: 60 }),
    lastName: varchar("last_name", { length: 60 }).notNull(),
    suffix: varchar("suffix", { length: 10 }),
    email: varchar("email", { length: 100 }),
    phoneNumber: varchar("phone_number", { length: 20 }),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (t) => ({
    authIdIdx: uniqueIndex("users_auth_id_idx").on(t.authId),
    barangayIdx: index("users_barangay_idx").on(t.barangayId),
    roleIdx: index("users_role_idx").on(t.role),
  }),
);

// ---------------------------------------------------------------------------
// Households
// ---------------------------------------------------------------------------

export const households = pgTable(
  "households",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    barangayId: uuid("barangay_id")
      .notNull()
      .references(() => barangays.id, { onDelete: "cascade" }),
    houseNumber: varchar("house_number", { length: 20 }),
    streetPurok: varchar("street_purok", { length: 100 }),
    headResidentId: uuid("head_resident_id"), // set after residents are created
    ...timestamps,
  },
  (t) => ({
    barangayIdx: index("households_barangay_idx").on(t.barangayId),
  }),
);

// ---------------------------------------------------------------------------
// Residents
// ---------------------------------------------------------------------------

export const residents = pgTable(
  "residents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "set null" })
      .unique(),
    // userId is null for residents not yet registered in the portal
    barangayId: uuid("barangay_id")
      .notNull()
      .references(() => barangays.id, { onDelete: "cascade" }),
    householdId: uuid("household_id").references(() => households.id, {
      onDelete: "set null",
    }),

    // Personal info
    firstName: varchar("first_name", { length: 60 }).notNull(),
    middleName: varchar("middle_name", { length: 60 }),
    lastName: varchar("last_name", { length: 60 }).notNull(),
    suffix: varchar("suffix", { length: 10 }),
    sex: sexEnum("sex").notNull(),
    birthDate: date("birth_date").notNull(),
    birthPlace: varchar("birth_place", { length: 100 }),
    civilStatus: civilStatusEnum("civil_status").notNull(),
    nationality: varchar("nationality", { length: 60 }).default("Filipino"),
    religion: varchar("religion", { length: 60 }),
    occupation: varchar("occupation", { length: 100 }),
    contactNumber: varchar("contact_number", { length: 20 }),
    email: varchar("email", { length: 100 }),

    // Voter info
    isRegisteredVoter: boolean("is_registered_voter").default(false),
    voterIdNumber: varchar("voter_id_number", { length: 50 }),

    // Flags
    isIndigenousPeople: boolean("is_indigenous_people").default(false),
    isSeniorCitizen: boolean("is_senior_citizen").default(false),
    isPwd: boolean("is_pwd").default(false),
    pwdType: varchar("pwd_type", { length: 60 }),
    isSoloParent: boolean("is_solo_parent").default(false),

    // Profile update approval flow
    pendingProfileUpdate: jsonb("pending_profile_update"),
    // stores the proposed changes, applied only after admin approval

    isVerified: boolean("is_verified").default(false).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    ...timestamps,
  },
  (t) => ({
    barangayIdx: index("residents_barangay_idx").on(t.barangayId),
    householdIdx: index("residents_household_idx").on(t.householdId),
    nameIdx: index("residents_name_idx").on(t.lastName, t.firstName),
  }),
);

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export const documentRequests = pgTable(
  "document_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    barangayId: uuid("barangay_id")
      .notNull()
      .references(() => barangays.id, { onDelete: "cascade" }),
    residentId: uuid("resident_id")
      .notNull()
      .references(() => residents.id, { onDelete: "cascade" }),
    requestedById: uuid("requested_by_id")
      .notNull()
      .references(() => users.id),
    // requestedById == resident's userId for self-service
    // requestedById == admin's userId for walk-in requests

    docType: docTypeEnum("doc_type").notNull(),
    purpose: text("purpose").notNull(),
    status: docStatusEnum("status").default("pending").notNull(),

    // Processing
    processedById: uuid("processed_by_id").references(() => users.id),
    processedAt: timestamp("processed_at"),
    rejectionReason: text("rejection_reason"),
    releasedAt: timestamp("released_at"),
    orNumber: varchar("or_number", { length: 50 }), // official receipt

    // Generated document reference (Supabase Storage path)
    documentPath: varchar("document_path", { length: 300 }),

    controlNumber: varchar("control_number", { length: 30 }).unique(),
    remarks: text("remarks"),
    ...timestamps,
  },
  (t) => ({
    barangayIdx: index("doc_requests_barangay_idx").on(t.barangayId),
    residentIdx: index("doc_requests_resident_idx").on(t.residentId),
    statusIdx: index("doc_requests_status_idx").on(t.status),
  }),
);

// ---------------------------------------------------------------------------
// Blotter
// ---------------------------------------------------------------------------

export const blotterCases = pgTable(
  "blotter_cases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    barangayId: uuid("barangay_id")
      .notNull()
      .references(() => barangays.id, { onDelete: "cascade" }),
    caseNumber: varchar("case_number", { length: 30 }).unique().notNull(),
    // e.g. BLT-2025-0001

    filedById: uuid("filed_by_id")
      .notNull()
      .references(() => users.id),

    complainantId: uuid("complainant_id").references(() => residents.id),
    complainantName: varchar("complainant_name", { length: 150 }),
    // complainantName used when complainant is not a registered resident

    respondentId: uuid("respondent_id").references(() => residents.id),
    respondentName: varchar("respondent_name", { length: 150 }),

    incidentDate: date("incident_date").notNull(),
    incidentLocation: varchar("incident_location", { length: 200 }),
    narrative: text("narrative").notNull(),

    status: blotterStatusEnum("status").default("filed").notNull(),
    resolvedAt: timestamp("resolved_at"),
    resolution: text("resolution"),

    isEscalated: boolean("is_escalated").default(false).notNull(),
    escalatedAt: timestamp("escalated_at"),
    escalationReason: text("escalation_reason"),

    assignedOfficialId: uuid("assigned_official_id").references(
      () => barangayOfficials.id,
      { onDelete: "set null" },
    ),
    ...timestamps,
  },
  (t) => ({
    barangayIdx: index("blotter_barangay_idx").on(t.barangayId),
    statusIdx: index("blotter_status_idx").on(t.status),
    caseNumberIdx: uniqueIndex("blotter_case_number_idx").on(t.caseNumber),
  }),
);

export const blotterProceedings = pgTable(
  "blotter_proceedings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    caseId: uuid("case_id")
      .notNull()
      .references(() => blotterCases.id, { onDelete: "cascade" }),
    recordedById: uuid("recorded_by_id")
      .notNull()
      .references(() => users.id),
    proceedingDate: date("proceeding_date").notNull(),
    notes: text("notes").notNull(),
    nextHearingDate: date("next_hearing_date"),
    ...timestamps,
  },
  (t) => ({
    caseIdx: index("proceedings_case_idx").on(t.caseId),
  }),
);

// ---------------------------------------------------------------------------
// Barangay Officials
// ---------------------------------------------------------------------------

export const barangayOfficials = pgTable(
  "barangay_officials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    barangayId: uuid("barangay_id")
      .notNull()
      .references(() => barangays.id, { onDelete: "cascade" }),
    residentId: uuid("resident_id").references(() => residents.id, {
      onDelete: "set null",
    }),
    position: officialPositionEnum("position").notNull(),
    termStart: date("term_start").notNull(),
    termEnd: date("term_end"),
    isActive: boolean("is_active").default(true).notNull(),
    signature: varchar("signature", { length: 300 }), // Supabase Storage path
    ...timestamps,
  },
  (t) => ({
    barangayIdx: index("officials_barangay_idx").on(t.barangayId),
    activeIdx: index("officials_active_idx").on(t.barangayId, t.isActive),
  }),
);

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postedById: uuid("posted_by_id")
      .notNull()
      .references(() => users.id),
    barangayId: uuid("barangay_id").references(() => barangays.id, {
      onDelete: "cascade",
    }),
    // null barangayId = municipality-wide broadcast (super_admin only)

    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull(),
    isPinned: boolean("is_pinned").default(false).notNull(),
    expiresAt: timestamp("expires_at"),
    ...timestamps,
  },
  (t) => ({
    barangayIdx: index("announcements_barangay_idx").on(t.barangayId),
  }),
);

// ---------------------------------------------------------------------------
// Financials
// ---------------------------------------------------------------------------

export const financialRecords = pgTable(
  "financial_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    barangayId: uuid("barangay_id")
      .notNull()
      .references(() => barangays.id, { onDelete: "cascade" }),
    recordedById: uuid("recorded_by_id")
      .notNull()
      .references(() => users.id),
    type: financialTypeEnum("type").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    description: text("description"),
    referenceNumber: varchar("reference_number", { length: 60 }),
    transactionDate: date("transaction_date").notNull(),
    fiscalYear: integer("fiscal_year").notNull(),
    quarter: integer("quarter"), // 1-4
    ...timestamps,
  },
  (t) => ({
    barangayIdx: index("financials_barangay_idx").on(t.barangayId),
    fiscalIdx: index("financials_fiscal_idx").on(t.barangayId, t.fiscalYear),
  }),
);

// ---------------------------------------------------------------------------
// Programs & Beneficiaries
// ---------------------------------------------------------------------------

export const programs = pgTable(
  "programs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    barangayId: uuid("barangay_id")
      .notNull()
      .references(() => barangays.id, { onDelete: "cascade" }),
    type: programTypeEnum("type").notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (t) => ({
    barangayIdx: index("programs_barangay_idx").on(t.barangayId),
  }),
);

export const programBeneficiaries = pgTable(
  "program_beneficiaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    residentId: uuid("resident_id")
      .notNull()
      .references(() => residents.id, { onDelete: "cascade" }),
    enrolledAt: date("enrolled_at").notNull(),
    removedAt: date("removed_at"),
    removalReason: text("removal_reason"),
    remarks: text("remarks"),
    ...timestamps,
  },
  (t) => ({
    programIdx: index("beneficiaries_program_idx").on(t.programId),
    residentIdx: index("beneficiaries_resident_idx").on(t.residentId),
  }),
);

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull(),
    body: text("body").notNull(),
    isRead: boolean("is_read").default(false).notNull(),
    relatedTable: varchar("related_table", { length: 60 }),
    relatedId: uuid("related_id"),
    // polymorphic ref — e.g. relatedTable='document_requests', relatedId=<uuid>
    ...timestamps,
  },
  (t) => ({
    userIdx: index("notifications_user_idx").on(t.userId),
    unreadIdx: index("notifications_unread_idx").on(t.userId, t.isRead),
  }),
);

// ---------------------------------------------------------------------------
// Audit Logs
// ---------------------------------------------------------------------------

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    barangayId: uuid("barangay_id").references(() => barangays.id, {
      onDelete: "set null",
    }),
    action: auditActionEnum("action").notNull(),
    tableName: varchar("table_name", { length: 60 }).notNull(),
    recordId: uuid("record_id"),
    previousValue: jsonb("previous_value"),
    newValue: jsonb("new_value"),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // no updatedAt — audit logs are immutable
  },
  (t) => ({
    actorIdx: index("audit_actor_idx").on(t.actorId),
    barangayIdx: index("audit_barangay_idx").on(t.barangayId),
    tableIdx: index("audit_table_idx").on(t.tableName, t.recordId),
  }),
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const barangaysRelations = relations(barangays, ({ many }) => ({
  users: many(users),
  residents: many(residents),
  households: many(households),
  officials: many(barangayOfficials),
  documentRequests: many(documentRequests),
  blotterCases: many(blotterCases),
  announcements: many(announcements),
  financialRecords: many(financialRecords),
  programs: many(programs),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  barangay: one(barangays, {
    fields: [users.barangayId],
    references: [barangays.id],
  }),
  resident: one(residents, {
    fields: [users.id],
    references: [residents.userId],
  }),
  notifications: many(notifications),
}));

export const residentsRelations = relations(residents, ({ one, many }) => ({
  barangay: one(barangays, {
    fields: [residents.barangayId],
    references: [barangays.id],
  }),
  household: one(households, {
    fields: [residents.householdId],
    references: [households.id],
  }),
  user: one(users, {
    fields: [residents.userId],
    references: [users.id],
  }),
  documentRequests: many(documentRequests),
  blotterCasesAsComplainant: many(blotterCases, {
    relationName: "complainant",
  }),
  blotterCasesAsRespondent: many(blotterCases, {
    relationName: "respondent",
  }),
  programBeneficiaries: many(programBeneficiaries),
}));

export const householdsRelations = relations(households, ({ one, many }) => ({
  barangay: one(barangays, {
    fields: [households.barangayId],
    references: [barangays.id],
  }),
  residents: many(residents),
}));

export const documentRequestsRelations = relations(
  documentRequests,
  ({ one }) => ({
    barangay: one(barangays, {
      fields: [documentRequests.barangayId],
      references: [barangays.id],
    }),
    resident: one(residents, {
      fields: [documentRequests.residentId],
      references: [residents.id],
    }),
    requestedBy: one(users, {
      fields: [documentRequests.requestedById],
      references: [users.id],
    }),
    processedBy: one(users, {
      fields: [documentRequests.processedById],
      references: [users.id],
    }),
  }),
);

export const blotterCasesRelations = relations(
  blotterCases,
  ({ one, many }) => ({
    barangay: one(barangays, {
      fields: [blotterCases.barangayId],
      references: [barangays.id],
    }),
    complainant: one(residents, {
      fields: [blotterCases.complainantId],
      references: [residents.id],
      relationName: "complainant",
    }),
    respondent: one(residents, {
      fields: [blotterCases.respondentId],
      references: [residents.id],
      relationName: "respondent",
    }),
    filedBy: one(users, {
      fields: [blotterCases.filedById],
      references: [users.id],
    }),
    assignedOfficial: one(barangayOfficials, {
      fields: [blotterCases.assignedOfficialId],
      references: [barangayOfficials.id],
    }),
    proceedings: many(blotterProceedings),
  }),
);

export const programsRelations = relations(programs, ({ one, many }) => ({
  barangay: one(barangays, {
    fields: [programs.barangayId],
    references: [barangays.id],
  }),
  beneficiaries: many(programBeneficiaries),
}));

export const programBeneficiariesRelations = relations(
  programBeneficiaries,
  ({ one }) => ({
    program: one(programs, {
      fields: [programBeneficiaries.programId],
      references: [programs.id],
    }),
    resident: one(residents, {
      fields: [programBeneficiaries.residentId],
      references: [residents.id],
    }),
  }),
);

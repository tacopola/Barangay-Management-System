import { pgEnum } from "drizzle-orm/pg-core"

export const roleEnum = pgEnum("role", ["super_admin", "barangay_admin", "resident"])

export const docTypeEnum = pgEnum("doc_type", [
  "barangay_clearance",
  "certificate_of_residency",
  "certificate_of_indigency",
  "barangay_id",
  "business_clearance",
  "good_moral_certificate",
])

export const docStatusEnum = pgEnum("doc_status", [
  "pending",
  "approved",
  "rejected",
  "released",
])

export const blotterStatusEnum = pgEnum("blotter_status", [
  "filed",
  "under_mediation",
  "settled",
  "escalated",
  "dismissed",
])

export const civilStatusEnum = pgEnum("civil_status", [
  "single",
  "married",
  "widowed",
  "separated",
  "annulled",
])

export const sexEnum = pgEnum("sex", ["male", "female"])

export const officialPositionEnum = pgEnum("official_position", [
  "punong_barangay",
  "kagawad",
  "sk_chairperson",
  "sk_kagawad",
  "barangay_secretary",
  "barangay_treasurer",
  "tanod",
])

export const programTypeEnum = pgEnum("program_type", [
  "4ps",
  "senior_citizen",
  "pwd",
  "solo_parent",
  "indigent",
])

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "approve",
  "reject",
  "login",
  "logout",
])

export const financialTypeEnum = pgEnum("financial_type", [
  "income",
  "expense",
])


"use server";

import { db } from "@/db";
import { auditLogs } from "@/db/schema";

type CreateAuditLogInput = {
  actorId?: string | null;
  barangayId?: string | null;

  action: "create" | "update" | "delete";

  tableName: string;
  recordId?: string | null;

  previousValue?: unknown;
  newValue?: unknown;

  ipAddress?: string | null;
};

export async function createAuditLog(
  input: CreateAuditLogInput,
) {
  await db.insert(auditLogs).values({
    actorId: input.actorId ?? null,
    barangayId: input.barangayId ?? null,

    action: input.action,

    tableName: input.tableName,
    recordId: input.recordId ?? null,

    previousValue:
      (input.previousValue as Record<string, unknown>) ?? null,

    newValue:
      (input.newValue as Record<string, unknown>) ?? null,

    ipAddress: input.ipAddress ?? null,
  });
}
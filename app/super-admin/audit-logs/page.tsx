import { requireRole } from "@/lib/auth";
import { db } from "@/db";

import { auditLogs, users, barangays } from "@/db/schema";

import { desc, eq, sql } from "drizzle-orm";

import { AuditLogsClient } from "@/components/super-admin/audit-log_tab/audit-logs-client";

async function getAuditLogs() {
  return db
    .select({
      id: auditLogs.id,

      action: auditLogs.action,
      tableName: auditLogs.tableName,
      recordId: auditLogs.recordId,

      previousValue: auditLogs.previousValue,
      newValue: auditLogs.newValue,

      ipAddress: auditLogs.ipAddress,
      createdAt: auditLogs.createdAt,

      barangayName: barangays.name,

      actorName: sql<string>`
        concat(${users.firstName}, ' ', ${users.lastName})
      `,

      actorRole: users.role,
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.actorId, users.id))
    .leftJoin(barangays, eq(auditLogs.barangayId, barangays.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);
}

export default async function AuditLogsPage() {
  await requireRole("super_admin");

  const logs = await getAuditLogs();

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Super Admin
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Review administrative activities and database-level changes.
        </p>
      </div>

      <AuditLogsClient logs={logs} />
    </div>
  );
}

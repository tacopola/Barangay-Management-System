import { getAuditLogs } from "@/db/queries/super-admin/audit-log";
import { AuditLogsClient } from "@/components/super-admin/audit-logs/audit-logs-client";

export default async function AuditLogsPage() {
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

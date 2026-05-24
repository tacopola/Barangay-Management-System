import { db } from "@/db";
import { auditLogs, users, barangays } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getAuditLogs = unstable_cache(
  async () => {
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
  },
  ["audit-logs"],
  {
    revalidate: 30,
  },
);

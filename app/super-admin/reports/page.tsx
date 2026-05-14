// app/super-admin/reports/page.tsx

import { requireRole } from "@/lib/auth";
import { db } from "@/db";

import {
  barangays,
  residents,
  announcements,
  programs,
} from "@/db/schema";

import { count, eq, sql } from "drizzle-orm";

import { ReportsClient } from "@/components/super-admin/report_tab/reports-client";

async function getOverviewStats() {
  const [
    [residentCount],
    [barangayCount],
    [announcementCount],
    [programCount],
  ] = await Promise.all([
    db.select({ count: count() }).from(residents),
    db.select({ count: count() }).from(barangays),
    db.select({ count: count() }).from(announcements),
    db.select({ count: count() }).from(programs),
  ]);

  return {
    residents: residentCount.count,
    barangays: barangayCount.count,
    announcements: announcementCount.count,
    programs: programCount.count,
  };
}

async function getResidentsPerBarangay() {
  return db
    .select({
      barangay: barangays.name,
      residents: sql<number>`count(${residents.id})`,
    })
    .from(barangays)
    .leftJoin(
      residents,
      eq(residents.barangayId, barangays.id)
    )
    .groupBy(barangays.id)
    .orderBy(barangays.name);
}

export default async function ReportsPage() {
  await requireRole("super_admin");

  const [overview, residentStats] = await Promise.all([
    getOverviewStats(),
    getResidentsPerBarangay(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Super Admin
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">
          Reports
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          View overall system statistics and barangay-level summaries.
        </p>
      </div>

      <ReportsClient
        overview={overview}
        residentStats={residentStats}
      />
    </div>
  );
}
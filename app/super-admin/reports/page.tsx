import { requireRole } from "@/lib/auth";
import { getReportsData } from "@/db/queries/super-admin/report";
import { ReportsClient } from "@/components/super-admin/reports/reports-client";

export default async function ReportsPage() {
  await requireRole("super_admin");

  const data = await getReportsData();

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Super Admin
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Consolidated municipality-wide statistics and analytics.
        </p>
      </div>

      <ReportsClient data={data} />
    </div>
  );
}

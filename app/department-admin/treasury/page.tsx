import { requireDepartmentAdminOf } from "@/lib/auth-helper";
import { TreasuryDashboardClient } from "@/components/department-admin/treasury/treasury-dashboard-client";

export default async function TreasuryDashboardPage() {
  const { admin } = await requireDepartmentAdminOf("treasury");

  const stats = {
    todayCollections: 0,
    weekCollections: 0,
    monthCollections: 0,
    pendingReceipts: 0,
  };

  return <TreasuryDashboardClient stats={stats} admin={admin} />;
}

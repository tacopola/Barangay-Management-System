import { requireBarangayAdmin } from "@/lib/auth-helper";
import {
  getAdminStats,
  getRecentDocRequests,
  getRecentBlotter,
  getBarangayName,
} from "@/db/queries/admin/dashboard";

import { AdminStatCards } from "@/components/admin/dashboard/admin-stat-cards";
import { RecentDocRequests } from "@/components/admin/dashboard/recent-doc-requests";
import { RecentBlotter } from "@/components/admin/dashboard/recent-blotter";

export default async function AdminDashboardPage() {
  const { admin, barangayId } = await requireBarangayAdmin();

  const [stats, recentDocs, recentBlotter, barangayName] = await Promise.all([
    getAdminStats(barangayId),
    getRecentDocRequests(barangayId),
    getRecentBlotter(barangayId),
    getBarangayName(barangayId),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Barangay Dashboard
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">
          {barangayName}
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Good day, {admin.firstName}. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <AdminStatCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentDocRequests requests={recentDocs} />
        <RecentBlotter cases={recentBlotter} />
      </div>
    </div>
  );
}

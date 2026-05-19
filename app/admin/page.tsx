import { requireBarangayAdmin } from "@/lib/auth-helper";
import { db } from "@/db";
import {
  residents,
  documentRequests,
  blotterCases,
  households,
  barangays,
} from "@/db/schema";
import { eq, count, and } from "drizzle-orm";
import { AdminStatCards } from "@/components/admin/dashboard/admin-stat-cards";
import { RecentDocRequests } from "@/components/admin/dashboard/recent-doc-requests";
import { RecentBlotter } from "@/components/admin/dashboard/recent-blotter";

async function getStats(barangayId: string) {
  const [totalResidents] = await db
    .select({ count: count() })
    .from(residents)
    .where(
      and(
        eq(residents.barangayId, barangayId),
        eq(residents.isArchived, false),
      ),
    );

  const [totalHouseholds] = await db
    .select({ count: count() })
    .from(households)
    .where(eq(households.barangayId, barangayId));

  const [pendingDocs] = await db
    .select({ count: count() })
    .from(documentRequests)
    .where(
      and(
        eq(documentRequests.barangayId, barangayId),
        eq(documentRequests.status, "pending"),
      ),
    );

  const [activeBlotters] = await db
    .select({ count: count() })
    .from(blotterCases)
    .where(
      and(
        eq(blotterCases.barangayId, barangayId),
        eq(blotterCases.status, "filed"),
      ),
    );

  return {
    totalResidents: totalResidents.count,
    totalHouseholds: totalHouseholds.count,
    pendingDocs: pendingDocs.count,
    activeBlotters: activeBlotters.count,
  };
}

async function getRecentDocRequests(barangayId: string) {
  return db
    .select()
    .from(documentRequests)
    .where(eq(documentRequests.barangayId, barangayId))
    .orderBy(documentRequests.createdAt)
    .limit(6);
}

async function getRecentBlotter(barangayId: string) {
  return db
    .select()
    .from(blotterCases)
    .where(eq(blotterCases.barangayId, barangayId))
    .orderBy(blotterCases.createdAt)
    .limit(6);
}

async function getBarangayName(barangayId: string) {
  const [brgy] = await db
    .select({ name: barangays.name })
    .from(barangays)
    .where(eq(barangays.id, barangayId))
    .limit(1);
  return brgy?.name ?? "Barangay";
}

export default async function AdminDashboardPage() {
  const { admin, barangayId } = await requireBarangayAdmin();

  const [stats, recentDocs, recentBlotter, barangayName] = await Promise.all([
    getStats(barangayId),
    getRecentDocRequests(barangayId),
    getRecentBlotter(barangayId),
    getBarangayName(barangayId),
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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

      {/* Stats */}
      <AdminStatCards stats={stats} />

      {/* Two column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentDocRequests requests={recentDocs} />
        <RecentBlotter cases={recentBlotter} />
      </div>
    </div>
  );
}

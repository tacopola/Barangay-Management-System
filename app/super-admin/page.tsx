import { requireRole } from "@/lib/auth"
import { db } from "@/db"
import { barangays, residents, documentRequests, blotterCases } from "@/db/schema"
import { eq, count } from "drizzle-orm"
import { BarangayTable } from "@/components/super-admin/barangay-table"

async function getStats() {
  const [totalBarangays] = await db.select({ count: count() }).from(barangays)
  const [totalResidents] = await db.select({ count: count() }).from(residents)
  const [pendingDocs] = await db
    .select({ count: count() })
    .from(documentRequests)
    .where(eq(documentRequests.status, "pending"))
  const [activeBlotters] = await db
    .select({ count: count() })
    .from(blotterCases)
    .where(eq(blotterCases.status, "filed"))

  return {
    totalBarangays: totalBarangays.count,
    totalResidents: totalResidents.count,
    pendingDocs: pendingDocs.count,
    activeBlotters: activeBlotters.count,
  }
}

async function getAllBarangays() {
  return db.select().from(barangays).orderBy(barangays.name)
}

export default async function SuperAdminPage() {
  await requireRole("super_admin")
  const [stats, allBarangays] = await Promise.all([getStats(), getAllBarangays()])

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Municipality-wide snapshot across all barangays
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Barangays" value={stats.totalBarangays} color="amber" />
        <StatCard label="Total Residents" value={stats.totalResidents.toLocaleString()} color="blue" />
        <StatCard label="Pending Requests" value={stats.pendingDocs} color="green" />
        <StatCard label="Active Blotters" value={stats.activeBlotters} color="red" />
      </div>

      {/* Barangay table */}
      <BarangayTable barangays={allBarangays} />

    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color: "amber" | "blue" | "green" | "red"
}) {
  const accent = {
    amber: "border-t-amber-500",
    blue: "border-t-blue-500",
    green: "border-t-emerald-500",
    red: "border-t-red-500",
  }[color]

  return (
    <div className={`rounded-xl border bg-card p-5 border-t-2 ${accent}`}>
      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-light tracking-tight">{value}</p>
    </div>
  )
}
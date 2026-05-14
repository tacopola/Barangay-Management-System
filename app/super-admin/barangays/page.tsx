import { requireRole } from "@/lib/auth"
import { db } from "@/db"
import { barangays, users, residents } from "@/db/schema"
import { eq, count, and } from "drizzle-orm"
import { BarangayListClient } from "@/components/super-admin/barangay_tab/barangay-list-client"

async function getBarangaysWithStats() {
  const all = await db.select().from(barangays).orderBy(barangays.name)

  const withStats = await Promise.all(
    all.map(async (b) => {
      const [adminCount] = await db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            eq(users.barangayId, b.id),
            eq(users.role, "barangay_admin"),
            eq(users.isActive, true)
          )
        )

      const [residentCount] = await db
        .select({ count: count() })
        .from(residents)
        .where(
          and(
            eq(residents.barangayId, b.id),
            eq(residents.isArchived, false)
          )
        )

      return {
        ...b,
        adminCount: adminCount.count,
        residentCount: residentCount.count,
      }
    })
  )

  return withStats
}

export default async function BarangaysPage() {
  await requireRole("super_admin")
  const data = await getBarangaysWithStats()

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Super Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Barangays</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all barangays under this municipality.
        </p>
      </div>
      <BarangayListClient barangays={data} />
    </div>
  )
}
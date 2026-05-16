import { requireRole } from "@/lib/auth"
import { db } from "@/db"
import {
  residents,
  documentRequests,
  blotterCases,
  barangays,
  programs,
  programBeneficiaries,
} from "@/db/schema"
import { eq, count, and, gte, sql } from "drizzle-orm"
import { ReportsClient } from "@/components/super-admin/report_tab/reports-client"

async function getReportsData() {
  // Per-barangay stats
  const allBarangays = await db
    .select({ id: barangays.id, name: barangays.name })
    .from(barangays)
    .where(eq(barangays.isActive, true))
    .orderBy(barangays.name)

  const barangayStats = await Promise.all(
    allBarangays.map(async (b) => {
      const [totalResidents] = await db
        .select({ count: count() })
        .from(residents)
        .where(and(eq(residents.barangayId, b.id), eq(residents.isArchived, false)))

      const [totalDocs] = await db
        .select({ count: count() })
        .from(documentRequests)
        .where(eq(documentRequests.barangayId, b.id))

      const [pendingDocs] = await db
        .select({ count: count() })
        .from(documentRequests)
        .where(and(eq(documentRequests.barangayId, b.id), eq(documentRequests.status, "pending")))

      const [totalBlotter] = await db
        .select({ count: count() })
        .from(blotterCases)
        .where(eq(blotterCases.barangayId, b.id))

      const [activeBlotter] = await db
        .select({ count: count() })
        .from(blotterCases)
        .where(and(eq(blotterCases.barangayId, b.id), eq(blotterCases.status, "filed")))

      const [beneficiaries] = await db
        .select({ count: count() })
        .from(programBeneficiaries)
        .leftJoin(programs, eq(programBeneficiaries.programId, programs.id))
        .where(eq(programs.barangayId, b.id))

      return {
        name: b.name,
        residents: totalResidents.count,
        totalDocs: totalDocs.count,
        pendingDocs: pendingDocs.count,
        totalBlotter: totalBlotter.count,
        activeBlotter: activeBlotter.count,
        beneficiaries: beneficiaries.count,
      }
    })
  )

  // Doc type breakdown (municipality-wide)
  const docTypeBreakdown = await db
    .select({
      docType: documentRequests.docType,
      count: count(),
    })
    .from(documentRequests)
    .groupBy(documentRequests.docType)
    .orderBy(sql`count(*) desc`)

  // Blotter status breakdown
  const blotterStatusBreakdown = await db
    .select({
      status: blotterCases.status,
      count: count(),
    })
    .from(blotterCases)
    .groupBy(blotterCases.status)

  // Program type breakdown
  const programBreakdown = await db
    .select({
      type: programs.type,
      count: count(),
    })
    .from(programBeneficiaries)
    .leftJoin(programs, eq(programBeneficiaries.programId, programs.id))
    .groupBy(programs.type)

  // Monthly doc requests (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const monthlyDocs = await db
    .select({
      month: sql<string>`to_char(${documentRequests.createdAt}, 'Mon YYYY')`,
      count: count(),
    })
    .from(documentRequests)
    .where(gte(documentRequests.createdAt, sixMonthsAgo))
    .groupBy(sql`to_char(${documentRequests.createdAt}, 'Mon YYYY')`)
    .orderBy(sql`min(${documentRequests.createdAt})`)

  // Totals
  const totalResidents = barangayStats.reduce((s, b) => s + b.residents, 0)
  const totalDocs = barangayStats.reduce((s, b) => s + b.totalDocs, 0)
  const totalBlotter = barangayStats.reduce((s, b) => s + b.totalBlotter, 0)
  const totalBeneficiaries = barangayStats.reduce((s, b) => s + b.beneficiaries, 0)

  return {
    barangayStats,
    docTypeBreakdown,
    blotterStatusBreakdown,
    programBreakdown,
    monthlyDocs,
    totals: { totalResidents, totalDocs, totalBlotter, totalBeneficiaries },
  }
}

export default async function ReportsPage() {
  await requireRole("super_admin")
  const data = await getReportsData()

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
  )
}
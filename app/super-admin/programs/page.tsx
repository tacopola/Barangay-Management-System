import { db } from "@/db"
import { programs, barangays, programBeneficiaries } from "@/db/schema"
import { eq, count } from "drizzle-orm"
import { ProgramListClient } from "@/components/super-admin/program_tab/program-list-client"

async function getProgramsWithStats() {
  const all = await db
    .select({
      id: programs.id,
      name: programs.name,
      type: programs.type,
      description: programs.description,
      isActive: programs.isActive,
      barangayId: programs.barangayId,
      barangayName: barangays.name,
      createdAt: programs.createdAt,
    })
    .from(programs)
    .leftJoin(barangays, eq(programs.barangayId, barangays.id))
    .orderBy(programs.name)

  const withStats = await Promise.all(
    all.map(async (p) => {
      const [beneficiaryCount] = await db
        .select({ count: count() })
        .from(programBeneficiaries)
        .where(eq(programBeneficiaries.programId, p.id))

      return { ...p, beneficiaryCount: beneficiaryCount.count }
    })
  )

  return withStats
}

async function getAllBarangays() {
  return db
    .select({ id: barangays.id, name: barangays.name })
    .from(barangays)
    .where(eq(barangays.isActive, true))
    .orderBy(barangays.name)
}

export default async function ProgramsPage() {
  const [data, allBarangays] = await Promise.all([
    getProgramsWithStats(),
    getAllBarangays(),
  ])

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Super Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Programs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage 4Ps, senior citizen, PWD, and other beneficiary programs.
        </p>
      </div>
      <ProgramListClient programs={data} barangays={allBarangays} />
    </div>
  )
}
import { db } from "@/db"
import { households, residents } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { HouseholdListClient } from "@/components/admin/household_tab/household-list-client"
import { requireBarangayAdmin } from "@/lib/auth-helper"

async function getHouseholdsWithMembers(barangayId: string) {
  const all = await db
    .select({
      id: households.id,
      houseNumber: households.houseNumber,
      streetPurok: households.streetPurok,
      headResidentId: households.headResidentId,
      createdAt: households.createdAt,
    })
    .from(households)
    .where(eq(households.barangayId, barangayId))
    .orderBy(households.streetPurok)

  const withMembers = await Promise.all(
    all.map(async (h) => {
      const members = await db
        .select({
          id: residents.id,
          firstName: residents.firstName,
          lastName: residents.lastName,
          sex: residents.sex,
          birthDate: residents.birthDate,
          isVerified: residents.isVerified,
        })
        .from(residents)
        .where(
          and(
            eq(residents.householdId, h.id),
            eq(residents.isArchived, false)
          )
        )
        .orderBy(residents.lastName)

      const head = members.find((m) => m.id === h.headResidentId) ?? null

      return {
        ...h,
        members,
        memberCount: members.length,
        headName: head ? `${head.firstName} ${head.lastName}` : null,
      }
    })
  )

  return withMembers
}

async function getUnassignedResidents(barangayId: string) {
  return db
    .select({
      id: residents.id,
      firstName: residents.firstName,
      lastName: residents.lastName,
    })
    .from(residents)
    .where(
      and(
        eq(residents.barangayId, barangayId),
        eq(residents.isArchived, false)
      )
    )
    .orderBy(residents.lastName)
}

export default async function HouseholdsPage() {
  const { barangayId } = await requireBarangayAdmin();

  const [allHouseholds, allResidents] = await Promise.all([
    getHouseholdsWithMembers(barangayId),
    getUnassignedResidents(barangayId),
  ])

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Barangay Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Households</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage family households and their members.
        </p>
      </div>
      <HouseholdListClient
        households={allHouseholds}
        allResidents={allResidents}
      />
    </div>
  )
}
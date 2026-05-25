import { db } from "@/db"
import {
  programs,
  programBeneficiaries,
  residents,
  users,
} from "@/db/schema"
import { eq, and, isNull, desc, ilike, or } from "drizzle-orm"
import { unstable_cache } from "next/cache"

export const getPrograms = (barangayId: string) =>
  unstable_cache(
    async () => {
      const rows = await db
        .select({
          id: programs.id,
          name: programs.name,
          type: programs.type,
          description: programs.description,
          isActive: programs.isActive,
          createdAt: programs.createdAt,
        })
        .from(programs)
        .where(eq(programs.barangayId, barangayId))
        .orderBy(desc(programs.createdAt))

      // Attach beneficiary count per program
      const counts = await db
        .select({
          programId: programBeneficiaries.programId,
        })
        .from(programBeneficiaries)
        .where(isNull(programBeneficiaries.removedAt))

      const countMap = new Map<string, number>()
      counts.forEach((c) => {
        countMap.set(c.programId, (countMap.get(c.programId) ?? 0) + 1)
      })

      return rows.map((p) => ({
        ...p,
        activeBeneficiaryCount: countMap.get(p.id) ?? 0,
      }))
    },
    [`programs-${barangayId}`],
    { revalidate: 60 },
  )()

// ---------------------------------------------------------------------------
// Single program with beneficiaries
// ---------------------------------------------------------------------------

export const getProgramWithBeneficiaries = (
  barangayId: string,
  programId: string,
) =>
  unstable_cache(
    async () => {
      const [program] = await db
        .select()
        .from(programs)
        .where(
          and(
            eq(programs.id, programId),
            eq(programs.barangayId, barangayId),
          ),
        )
        .limit(1)

      if (!program) return null

      const beneficiaries = await db
        .select({
          id: programBeneficiaries.id,
          residentId: programBeneficiaries.residentId,
          enrolledAt: programBeneficiaries.enrolledAt,
          removedAt: programBeneficiaries.removedAt,
          removalReason: programBeneficiaries.removalReason,
          remarks: programBeneficiaries.remarks,
          firstName: residents.firstName,
          middleName: residents.middleName,
          lastName: residents.lastName,
          suffix: residents.suffix,
          contactNumber: residents.contactNumber,
          isSeniorCitizen: residents.isSeniorCitizen,
          isPwd: residents.isPwd,
          isSoloParent: residents.isSoloParent,
        })
        .from(programBeneficiaries)
        .leftJoin(residents, eq(programBeneficiaries.residentId, residents.id))
        .where(eq(programBeneficiaries.programId, programId))
        .orderBy(desc(programBeneficiaries.enrolledAt))

      return { program, beneficiaries }
    },
    [`program-detail-${barangayId}-${programId}`],
    { revalidate: 30 },
  )()

// ---------------------------------------------------------------------------
// Residents eligible for enrollment (not already active in this program)
// ---------------------------------------------------------------------------

export const getEligibleResidents = (
  barangayId: string,
  programId: string,
  search?: string,
) =>
  unstable_cache(
    async () => {
      // Get already-active beneficiary residentIds
      const active = await db
        .select({ residentId: programBeneficiaries.residentId })
        .from(programBeneficiaries)
        .where(
          and(
            eq(programBeneficiaries.programId, programId),
            isNull(programBeneficiaries.removedAt),
          ),
        )

      const excludeIds = active.map((a) => a.residentId)

      const baseWhere = and(
        eq(residents.barangayId, barangayId),
        eq(residents.isArchived, false),
        eq(residents.isVerified, true),
      )

      const rows = await db
        .select({
          id: residents.id,
          firstName: residents.firstName,
          middleName: residents.middleName,
          lastName: residents.lastName,
          suffix: residents.suffix,
          contactNumber: residents.contactNumber,
        })
        .from(residents)
        .where(
          search
            ? and(
                baseWhere,
                or(
                  ilike(residents.firstName, `%${search}%`),
                  ilike(residents.lastName, `%${search}%`),
                ),
              )
            : baseWhere,
        )
        .orderBy(residents.lastName, residents.firstName)
        .limit(50)

      return rows.filter((r) => !excludeIds.includes(r.id))
    },
    [
      `eligible-residents-${barangayId}-${programId}-${search ?? ""}`,
    ],
    { revalidate: 30 },
  )()
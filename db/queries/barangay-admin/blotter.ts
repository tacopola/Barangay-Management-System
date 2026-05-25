import { db } from "@/db"
import { blotterCases, blotterProceedings, residents, users } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { unstable_cache } from "next/cache"

export const getBlotterCases = (barangayId: string) =>
  unstable_cache(
    async () => {
      return db
        .select({
          id: blotterCases.id,
          caseNumber: blotterCases.caseNumber,
          status: blotterCases.status,
          incidentDate: blotterCases.incidentDate,
          incidentLocation: blotterCases.incidentLocation,
          narrative: blotterCases.narrative,
          isEscalated: blotterCases.isEscalated,
          complainantName: blotterCases.complainantName,
          respondentName: blotterCases.respondentName,
          complainantId: blotterCases.complainantId,
          respondentId: blotterCases.respondentId,
          resolvedAt: blotterCases.resolvedAt,
          createdAt: blotterCases.createdAt,
        })
        .from(blotterCases)
        .where(eq(blotterCases.barangayId, barangayId))
        .orderBy(desc(blotterCases.createdAt))
    },
    [`blotter-cases-${barangayId}`],
    { revalidate: 15 }
  )()

export const getBlotterCase = (id: string, barangayId: string) =>
  unstable_cache(
    async () => {
      const [blotterCase] = await db
        .select()
        .from(blotterCases)
        .where(
          and(
            eq(blotterCases.id, id),
            eq(blotterCases.barangayId, barangayId)
          )
        )
        .limit(1)

      if (!blotterCase) return null

      const proceedings = await db
        .select({
          id: blotterProceedings.id,
          proceedingDate: blotterProceedings.proceedingDate,
          notes: blotterProceedings.notes,
          nextHearingDate: blotterProceedings.nextHearingDate,
          createdAt: blotterProceedings.createdAt,
          recordedById: blotterProceedings.recordedById,
        })
        .from(blotterProceedings)
        .where(eq(blotterProceedings.caseId, id))
        .orderBy(desc(blotterProceedings.createdAt))

      return { ...blotterCase, proceedings }
    },
    [`blotter-case-${id}`],
    { revalidate: 15 }
  )()

export const getResidentBlotterCases = (residentId: string) =>
  unstable_cache(
    async () => {
      return db
        .select({
          id: blotterCases.id,
          caseNumber: blotterCases.caseNumber,
          status: blotterCases.status,
          incidentDate: blotterCases.incidentDate,
          incidentLocation: blotterCases.incidentLocation,
          narrative: blotterCases.narrative,
          isEscalated: blotterCases.isEscalated,
          respondentName: blotterCases.respondentName,
          resolvedAt: blotterCases.resolvedAt,
          resolution: blotterCases.resolution,
          createdAt: blotterCases.createdAt,
        })
        .from(blotterCases)
        .where(eq(blotterCases.complainantId, residentId))
        .orderBy(desc(blotterCases.createdAt))
    },
    [`resident-blotter-${residentId}`],
    { revalidate: 30 }
  )()

export const getResidentsForBlotter = (barangayId: string) =>
  unstable_cache(
    async () => {
      return db
        .select({
          id: residents.id,
          firstName: residents.firstName,
          lastName: residents.lastName,
          middleName: residents.middleName,
        })
        .from(residents)
        .where(
          and(
            eq(residents.barangayId, barangayId),
            eq(residents.isArchived, false)
          )
        )
        .orderBy(residents.lastName)
    },
    [`blotter-residents-${barangayId}`],
    { revalidate: 60 }
  )()
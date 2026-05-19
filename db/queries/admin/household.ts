import { db } from "@/db";
import { households, residents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getHouseholdsWithMembers = (barangayId: string) =>
  unstable_cache(
    async () => {
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
        .orderBy(households.streetPurok);

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
                eq(residents.isArchived, false),
              ),
            )
            .orderBy(residents.lastName);

          const head = members.find((m) => m.id === h.headResidentId) ?? null;

          return {
            ...h,
            members,
            memberCount: members.length,
            headName: head ? `${head.firstName} ${head.lastName}` : null,
          };
        }),
      );

      return withMembers;
    },
    [`households-with-members-${barangayId}`],
    {
      revalidate: 60,
    },
  )();

export const getUnassignedResidents = (barangayId: string) =>
  unstable_cache(
    async () => {
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
            eq(residents.isArchived, false),
          ),
        )
        .orderBy(residents.lastName);
    },
    [`unassigned-residents-${barangayId}`],
    {
      revalidate: 120,
    },
  )();

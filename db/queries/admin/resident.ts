import { db } from "@/db";
import { residents, households } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getResidents = (barangayId: string) =>
  unstable_cache(
    async () => {
      return db
        .select({
          id: residents.id,
          firstName: residents.firstName,
          middleName: residents.middleName,
          lastName: residents.lastName,
          suffix: residents.suffix,
          sex: residents.sex,
          birthDate: residents.birthDate,
          birthPlace: residents.birthPlace,
          civilStatus: residents.civilStatus,
          nationality: residents.nationality,
          religion: residents.religion,
          occupation: residents.occupation,
          contactNumber: residents.contactNumber,
          email: residents.email,
          householdId: residents.householdId,
          isVerified: residents.isVerified,
          isArchived: residents.isArchived,
          isSeniorCitizen: residents.isSeniorCitizen,
          isPwd: residents.isPwd,
          pwdType: residents.pwdType,
          isSoloParent: residents.isSoloParent,
          isRegisteredVoter: residents.isRegisteredVoter,
          voterIdNumber: residents.voterIdNumber,
          isIndigenousPeople: residents.isIndigenousPeople,
          userId: residents.userId,
          createdAt: residents.createdAt,
        })
        .from(residents)
        .where(eq(residents.barangayId, barangayId))
        .orderBy(residents.lastName, residents.firstName);
    },
    [`residents-${barangayId}`],
    {
      revalidate: 60,
    }
  )();


export const getHouseholds = (barangayId: string) =>
  unstable_cache(
    async () => {
      return db
        .select({
          id: households.id,
          streetPurok: households.streetPurok,
          houseNumber: households.houseNumber,
        })
        .from(households)
        .where(eq(households.barangayId, barangayId))
        .orderBy(households.streetPurok);
    },
    [`households-${barangayId}`],
    {
      revalidate: 300,
    }
  )();
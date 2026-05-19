import { requireRole } from "@/lib/auth"
import { requireBarangayAdmin } from "@/lib/auth-helper"
import { db } from "@/db"
import { residents, households } from "@/db/schema"
import { eq } from "drizzle-orm"
import { ResidentListClient } from "@/components/admin/resident_tab/resident-list-client"

async function getResidents(barangayId: string) {
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
    .orderBy(residents.lastName, residents.firstName)
}

async function getHouseholds(barangayId: string) {
  return db
    .select({ id: households.id, streetPurok: households.streetPurok, houseNumber: households.houseNumber })
    .from(households)
    .where(eq(households.barangayId, barangayId))
    .orderBy(households.streetPurok)
}

export default async function ResidentsPage() {
  const { barangayId } = await requireBarangayAdmin()

  const [allResidents, allHouseholds] = await Promise.all([
    getResidents(barangayId),
    getHouseholds(barangayId),
  ])

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Barangay Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Residents</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all registered residents in your barangay.
        </p>
      </div>
      <ResidentListClient
        residents={allResidents}
        households={allHouseholds}
      />
    </div>
  )
}
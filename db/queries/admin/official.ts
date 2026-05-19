import { db } from "@/db";
import { barangayOfficials, residents } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getOfficials(barangayId: string) {
  const rows = await db
    .select({
      id: barangayOfficials.id,
      residentId: barangayOfficials.residentId,
      position: barangayOfficials.position,
      termStart: barangayOfficials.termStart,
      termEnd: barangayOfficials.termEnd,
      isActive: barangayOfficials.isActive,

      firstName: residents.firstName,
      lastName: residents.lastName,
    })
    .from(barangayOfficials)
    .leftJoin(residents, eq(barangayOfficials.residentId, residents.id))
    .where(eq(barangayOfficials.barangayId, barangayId));

  return rows.map((o) => ({
    id: o.id,
    residentId: o.residentId,
    position: o.position,
    termStart: o.termStart?.toString() ?? null,
    termEnd: o.termEnd?.toString() ?? null,
    isActive: o.isActive,

    residentName:
      o.firstName && o.lastName ? `${o.firstName} ${o.lastName}` : null,
  }));
}

export async function getResidents(barangayId: string) {
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
}

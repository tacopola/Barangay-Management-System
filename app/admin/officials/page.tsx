import { db } from "@/db";
import { barangayOfficials, residents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { OfficialListClient } from "@/components/admin/officials_tab/officials-list-client";
import { requireBarangayAdmin } from "@/lib/auth-helper";

async function getOfficials(barangayId: string) {
  const all = await db
    .select({
      id: barangayOfficials.id,
      residentId: barangayOfficials.residentId,
      position: barangayOfficials.position,
      termStart: barangayOfficials.termStart,
      termEnd: barangayOfficials.termEnd,
      isActive: barangayOfficials.isActive,
    })
    .from(barangayOfficials)
    .where(eq(barangayOfficials.barangayId, barangayId));

  const withResidents = await Promise.all(
    all.map(async (o) => {
      let residentName: string | null = null;

      if (o.residentId) {
        const [r] = await db
          .select({
            firstName: residents.firstName,
            lastName: residents.lastName,
          })
          .from(residents)
          .where(
            and(
              eq(residents.id, o.residentId),
              eq(residents.barangayId, barangayId)
            )
          )
          .limit(1);

        if (r) {
          residentName = `${r.firstName} ${r.lastName}`;
        }
      }

      return {
        ...o,
        termStart: o.termStart?.toString(),
        termEnd: o.termEnd?.toString() ?? null,
        residentName,
      };
    })
  );

  return withResidents;
}

async function getResidents(barangayId: string) {
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
    .orderBy(residents.lastName);
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function OfficialsPage() {
  const { barangayId } = await requireBarangayAdmin();

  const [officials, allResidents] = await Promise.all([
    getOfficials(barangayId),
    getResidents(barangayId),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Barangay Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Barangay Officials
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage officials and view the organizational structure.
        </p>
      </div>

      <OfficialListClient officials={officials} allResidents={allResidents} />
    </div>
  );
}
import { requireBarangayAdmin } from "@/lib/auth-helper";
import { getResidents, getHouseholds } from "@/db/queries/admin/resident";

import { ResidentListClient } from "@/components/admin/resident_tab/resident-list-client";

export default async function ResidentsPage() {
  const { barangayId } = await requireBarangayAdmin();

  const [allResidents, allHouseholds] = await Promise.all([
    getResidents(barangayId),
    getHouseholds(barangayId),
  ]);

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

      <ResidentListClient residents={allResidents} households={allHouseholds} />
    </div>
  );
}

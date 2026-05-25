import { requireBarangayAdmin } from "@/lib/auth-helper";
import {
  getHouseholdsWithMembers,
  getUnassignedResidents,
} from "@/db/queries/barangay-admin/household";

import { HouseholdListClient } from "@/components/admin/households/household-list-client";

export default async function HouseholdsPage() {
  const { barangayId } = await requireBarangayAdmin();

  const [allHouseholds, allResidents] = await Promise.all([
    getHouseholdsWithMembers(barangayId),
    getUnassignedResidents(barangayId),
  ]);

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

      <HouseholdListClient households={allHouseholds} />
    </div>
  );
}

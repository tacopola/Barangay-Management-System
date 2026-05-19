import { requireBarangayAdmin } from "@/lib/auth-helper";
import {
  getOfficials,
  getResidents,
} from "@/db/queries/admin/official";

import { OfficialListClient } from "@/components/admin/officials_tab/officials-list-client";

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

      <OfficialListClient
        officials={officials}
        allResidents={allResidents}
      />
    </div>
  );
}
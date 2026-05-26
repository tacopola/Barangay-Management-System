import { getBarangaysWithStats } from "@/db/queries/super-admin/barangay";
import { BarangayListClient } from "@/components/super-admin/barangays/barangay-list-client";

export default async function BarangaysPage() {
  const data = await getBarangaysWithStats();

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Super Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Barangays</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage all barangays under this municipality.
        </p>
      </div>

      <BarangayListClient barangays={data} />
    </div>
  );
}

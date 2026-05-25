import { requireBarangayAdmin } from "@/lib/auth-helper";
import {
  getBlotterCases,
  getResidentsForBlotter,
} from "@/db/queries/barangay-admin/blotter";
import { BlotterListClient } from "@/components/admin/blotters/blotter-list-client";

export default async function BlotterPage() {
  const { barangayId } = await requireBarangayAdmin();

  const [cases, residentsList] = await Promise.all([
    getBlotterCases(barangayId),
    getResidentsForBlotter(barangayId),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Barangay Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Blotter</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage incident reports and Katarungang Pambarangay cases.
        </p>
      </div>
      <BlotterListClient cases={cases} residents={residentsList} />
    </div>
  );
}

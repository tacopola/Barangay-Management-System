import { requireBarangayAdmin } from "@/lib/auth-helper";
import { getPrograms } from "@/db/queries/barangay-admin/program";
import { ProgramsClient } from "@/components/admin/programs/program-client";

export default async function ProgramsPage() {
  const { barangayId } = await requireBarangayAdmin();
  const programs = await getPrograms(barangayId);

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Barangay Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Programs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage barangay programs and their beneficiaries.
        </p>
      </div>
      <ProgramsClient programs={programs} />
    </div>
  );
}

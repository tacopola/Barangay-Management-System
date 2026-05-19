import {
  getProgramsWithStats,
  getAllBarangays,
} from "@/db/queries/super-admin/program";

import { ProgramListClient } from "@/components/super-admin/program_tab/program-list-client";

export default async function ProgramsPage() {
  const [data, allBarangays] = await Promise.all([
    getProgramsWithStats(),
    getAllBarangays(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Super Admin
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">Programs</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Manage 4Ps, senior citizen, PWD, and other beneficiary programs.
        </p>
      </div>

      <ProgramListClient programs={data} barangays={allBarangays} />
    </div>
  );
}

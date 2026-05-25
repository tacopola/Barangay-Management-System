import { requireBarangayAdmin } from "@/lib/auth-helper";
import { getProgramWithBeneficiaries } from "@/db/queries/barangay-admin/program";
import { ProgramDetailClient } from "@/components/admin/programs/program-detail-client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { barangayId } = await requireBarangayAdmin();
  const { id } = await params;

  const data = await getProgramWithBeneficiaries(barangayId, id);
  if (!data) notFound();

  return (
    <div className="p-6 space-y-6">
      <div>
        <Link
          href="/admin/programs"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ChevronLeft className="h-3 w-3" />
          Back to Programs
        </Link>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Barangay Admin · Programs
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {data.program.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage beneficiaries enrolled in this program.
        </p>
      </div>
      <ProgramDetailClient
        program={data.program}
        beneficiaries={data.beneficiaries}
      />
    </div>
  );
}

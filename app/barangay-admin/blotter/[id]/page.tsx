import { notFound } from "next/navigation";

import { requireBarangayAdmin } from "@/lib/auth-helper";
import { getBlotterCase } from "@/db/queries/barangay-admin/blotter";

import { BlotterCaseClient } from "@/components/admin/blotters/blotter-case-client";

export default async function BlotterCasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { barangayId } = await requireBarangayAdmin();

  const blotterCase = await getBlotterCase(id, barangayId);

  if (!blotterCase) {
    notFound();
  }

  return (
    <div className="p-6">
      <BlotterCaseClient blotterCase={blotterCase} />
    </div>
  );
}

import { requireResident } from "@/lib/auth-helper";
import { getMyRequests } from "@/db/queries/resident/document";
import { ResidentDocumentsClient } from "@/components/resident/resident-documents-client";

export default async function ResidentDocumentsPage() {
  const { resident } = await requireResident();
  const requests = await getMyRequests(resident.id);

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          Services
        </p>
        <h1 className="text-xl font-bold">My Documents</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Request and track your barangay documents.
        </p>
      </div>

      <ResidentDocumentsClient requests={requests} />
    </div>
  );
}

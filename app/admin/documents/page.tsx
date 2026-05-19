import { requireBarangayAdmin } from "@/lib/auth-helper";

import {
  getDocumentRequests,
  getResidentsList,
} from "@/db/queries/admin/document";

import { DocumentQueueClient } from "@/components/admin/document_tab/document-queue-client";

export default async function DocumentsPage() {
  const { barangayId } = await requireBarangayAdmin();

  const [requests, residentsList] = await Promise.all([
    getDocumentRequests(barangayId),
    getResidentsList(barangayId),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Barangay Admin
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">
          Document Requests
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Manage and process all document requests from residents.
        </p>
      </div>

      <DocumentQueueClient requests={requests} residents={residentsList} />
    </div>
  );
}

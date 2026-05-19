import { db } from "@/db"
import { documentRequests, residents } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { DocumentQueueClient } from "@/components/admin/document_tab/document-queue-client"
import { requireBarangayAdmin } from "@/lib/auth-helper"

async function getDocumentRequests(barangayId: string) {
  const requests = await db
    .select({
      id: documentRequests.id,
      docType: documentRequests.docType,
      purpose: documentRequests.purpose,
      status: documentRequests.status,
      controlNumber: documentRequests.controlNumber,
      rejectionReason: documentRequests.rejectionReason,
      orNumber: documentRequests.orNumber,
      processedAt: documentRequests.processedAt,
      releasedAt: documentRequests.releasedAt,
      createdAt: documentRequests.createdAt,
      residentId: documentRequests.residentId,
      requestedById: documentRequests.requestedById,
      residentFirstName: residents.firstName,
      residentLastName: residents.lastName,
      residentMiddleName: residents.middleName,
      residentContact: residents.contactNumber,
    })
    .from(documentRequests)
    .leftJoin(residents, eq(documentRequests.residentId, residents.id))
    .where(eq(documentRequests.barangayId, barangayId))
    .orderBy(desc(documentRequests.createdAt))

  return requests
}

async function getResidentsList(barangayId: string) {
  return db
    .select({
      id: residents.id,
      firstName: residents.firstName,
      lastName: residents.lastName,
      middleName: residents.middleName,
    })
    .from(residents)
    .where(eq(residents.barangayId, barangayId))
    .orderBy(residents.lastName)
}

export default async function DocumentsPage() {
  const { barangayId } = await requireBarangayAdmin();

  const [requests, residentsList] = await Promise.all([
    getDocumentRequests(barangayId),
    getResidentsList(barangayId),
  ])

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Barangay Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Document Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and process all document requests from residents.
        </p>
      </div>
      <DocumentQueueClient requests={requests} residents={residentsList} />
    </div>
  )
}
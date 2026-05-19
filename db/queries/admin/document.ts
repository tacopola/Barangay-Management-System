import { db } from "@/db";
import { documentRequests, residents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getDocumentRequests(barangayId: string) {
  return db
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
    .orderBy(desc(documentRequests.createdAt));
}


export async function getResidentsList(barangayId: string) {
  return db
    .select({
      id: residents.id,
      firstName: residents.firstName,
      lastName: residents.lastName,
      middleName: residents.middleName,
    })
    .from(residents)
    .where(eq(residents.barangayId, barangayId))
    .orderBy(residents.lastName);
}
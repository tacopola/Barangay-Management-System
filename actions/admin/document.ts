"use server";

import { db } from "@/db";
import { documentRequests, residents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { docTypeEnum } from "@/db/schema/enums";
import { requireBarangayAdmin, requireResident } from "@/lib/auth-helper";

const requestSchema = z.object({
  docType: z.enum(docTypeEnum.enumValues, {
    message: "Document type is required",
  }),
  purpose: z.string().min(5, "Purpose must be at least 5 characters"),
});

export type DocRequestFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  requestId?: string;
};

function generateControlNumber(docType: string, barangayId: string) {
  const prefix: Record<string, string> = {
    barangay_clearance: "BC",
    certificate_of_residency: "CR",
    certificate_of_indigency: "CI",
    barangay_id: "ID",
    business_clearance: "BZ",
    good_moral_certificate: "GM",
  };
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix[docType] ?? "DOC"}-${year}${month}-${rand}`;
}

export async function requestDocumentAction(
  _prev: DocRequestFormState,
  formData: FormData,
): Promise<DocRequestFormState> {
  const { resident: user, barangayId } = await requireResident();

  const raw = {
    docType: formData.get("docType") as string,
    purpose: formData.get("purpose") as string,
  };

  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const [resident] = await db
    .select()
    .from(residents)
    .where(eq(residents.userId, user.id))
    .limit(1);

  if (!resident) return { error: "Resident record not found." };

  const controlNumber = generateControlNumber(parsed.data.docType, barangayId);

  try {
    const [newRequest] = await db
      .insert(documentRequests)
      .values({
        barangayId,
        residentId: resident.id,
        requestedById: user.id,
        docType: parsed.data.docType,
        purpose: parsed.data.purpose,
        status: "pending",
        controlNumber,
      })
      .returning({ id: documentRequests.id });

    revalidatePath("/resident/documents");
    return { success: true, requestId: newRequest.id };
  } catch (e) {
    console.error("Error creating document request:", e);
    return { error: "Failed to submit request. Please try again." };
  }
}

export async function adminRequestDocumentAction(
  _prev: DocRequestFormState,
  formData: FormData,
): Promise<DocRequestFormState> {
  const { admin } = await requireBarangayAdmin();

  const residentId = formData.get("residentId") as string;
  const raw = {
    docType: formData.get("docType") as string,
    purpose: formData.get("purpose") as string,
  };

  if (!residentId) return { error: "Please select a resident." };

  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const controlNumber = generateControlNumber(
    parsed.data.docType,
    admin.barangayId!,
  );

  try {
    const [newRequest] = await db
      .insert(documentRequests)
      .values({
        barangayId: admin.barangayId!,
        residentId,
        requestedById: admin.id,
        docType: parsed.data.docType,
        purpose: parsed.data.purpose,
        status: "pending",
        controlNumber,
      })
      .returning({ id: documentRequests.id });

    revalidatePath("/admin/documents");
    return { success: true, requestId: newRequest.id };
  } catch (e) {
    console.error("Error creating document request:", e);
    return { error: "Failed to create request. Please try again." };
  }
}

export async function approveDocumentAction(
  id: string,
): Promise<{ error?: string }> {
  const { admin } = await requireBarangayAdmin();

  try {
    await db
      .update(documentRequests)
      .set({
        status: "approved",
        processedById: admin.id,
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(documentRequests.id, id),
          eq(documentRequests.barangayId, admin.barangayId!),
        ),
      );

    revalidatePath("/admin/documents");
    return {};
  } catch (e) {
    console.error("Error approving document request:", e);
    return { error: "Failed to approve request." };
  }
}

export async function rejectDocumentAction(
  id: string,
  reason: string,
): Promise<{ error?: string }> {
  const { admin } = await requireBarangayAdmin();

  if (!reason || reason.length < 5) {
    return { error: "Please provide a rejection reason." };
  }

  try {
    await db
      .update(documentRequests)
      .set({
        status: "rejected",
        processedById: admin.id,
        processedAt: new Date(),
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(documentRequests.id, id),
          eq(documentRequests.barangayId, admin.barangayId!),
        ),
      );

    revalidatePath("/admin/documents");
    return {};
  } catch (e) {
    console.error("Error rejecting document request:", e);
    return { error: "Failed to reject request." };
  }
}

export async function releaseDocumentAction(
  id: string,
  orNumber: string,
): Promise<{ error?: string }> {
  const { admin } = await requireBarangayAdmin();

  try {
    await db
      .update(documentRequests)
      .set({
        status: "released",
        releasedAt: new Date(),
        orNumber: orNumber || null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(documentRequests.id, id),
          eq(documentRequests.barangayId, admin.barangayId!),
        ),
      );

    revalidatePath("/admin/documents");
    return {};
  } catch (e) {
    console.error("Error releasing document:", e);
    return { error: "Failed to release document." };
  }
}

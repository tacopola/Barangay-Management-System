"use server";

import { db } from "@/db";
import { blotterCases, blotterProceedings, residents } from "@/db/schema";
import { eq, and, or, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireBarangayAdmin, requireResident } from "@/lib/auth-helper";
import { createAuditLog } from "@/lib/audit/audit-log";

const blotterSchema = z.object({
  complainantId: z.string().uuid().optional().or(z.literal("")),
  complainantName: z.string().optional(),
  respondentId: z.string().uuid().optional().or(z.literal("")),
  respondentName: z.string().min(1, "Respondent name is required"),
  incidentDate: z.string().min(1, "Incident date is required"),
  incidentLocation: z.string().min(1, "Incident location is required"),
  narrative: z.string().min(10, "Narrative must be at least 10 characters"),
});

const proceedingSchema = z.object({
  proceedingDate: z.string().min(1, "Proceeding date is required"),
  notes: z.string().min(5, "Notes must be at least 5 characters"),
  nextHearingDate: z.string().optional(),
});

const residentBlotterSchema = z.object({
  respondentName: z.string().min(1, "Respondent name is required"),
  incidentDate: z.string().min(1, "Incident date is required"),
  incidentLocation: z.string().min(1, "Incident location is required"),
  narrative: z.string().min(10, "Please describe the incident in detail"),
});

export type BlotterFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  caseId?: string;
};

function generateCaseNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `BLT-${year}-${rand}`;
}

async function resolveResidentName(residentId: string): Promise<string | null> {
  if (!residentId) return null;
  const [resident] = await db
    .select({
      firstName: residents.firstName,
      middleName: residents.middleName,
      lastName: residents.lastName,
      suffix: residents.suffix,
    })
    .from(residents)
    .where(eq(residents.id, residentId))
    .limit(1);

  if (!resident) return null;

  return [
    resident.firstName,
    resident.middleName,
    resident.lastName,
    resident.suffix,
  ]
    .filter(Boolean)
    .join(" ");
}

export async function createBlotterAction(
  _prev: BlotterFormState,
  formData: FormData,
): Promise<BlotterFormState> {
  const { admin, barangayId } = await requireBarangayAdmin();

  const raw = {
    complainantId: (formData.get("complainantId") as string) || undefined,
    complainantName: (formData.get("complainantName") as string) || undefined,
    respondentId: (formData.get("respondentId") as string) || undefined,
    respondentName: formData.get("respondentName") as string,
    incidentDate: formData.get("incidentDate") as string,
    incidentLocation: formData.get("incidentLocation") as string,
    narrative: formData.get("narrative") as string,
  };

  const parsed = blotterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  // Resolve names from resident IDs if selected
  const complainantName = parsed.data.complainantId
    ? await resolveResidentName(parsed.data.complainantId)
    : parsed.data.complainantName || null;

  const respondentName = parsed.data.respondentId
    ? ((await resolveResidentName(parsed.data.respondentId)) ??
      parsed.data.respondentName)
    : parsed.data.respondentName;

  try {
    const [newCase] = await db
      .insert(blotterCases)
      .values({
        barangayId,
        caseNumber: generateCaseNumber(),
        filedById: admin.id,
        complainantId: parsed.data.complainantId || null,
        complainantName,
        respondentId: parsed.data.respondentId || null,
        respondentName,
        incidentDate: parsed.data.incidentDate,
        incidentLocation: parsed.data.incidentLocation,
        narrative: parsed.data.narrative,
        status: "filed",
        isEscalated: false,
      })
      .returning();

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "create",
      tableName: "blotter_cases",
      recordId: newCase.id,
      newValue: newCase,
    });

    revalidatePath("/admin/blotter");
    return { success: true, caseId: newCase.id };
  } catch (e) {
    console.error("Error creating blotter case:", e);
    return { error: "Failed to file blotter case. Please try again." };
  }
}

export async function updateBlotterAction(
  id: string,
  _prev: BlotterFormState,
  formData: FormData,
): Promise<BlotterFormState> {
  const { admin, barangayId } = await requireBarangayAdmin();

  const raw = {
    complainantId: (formData.get("complainantId") as string) || undefined,
    complainantName: (formData.get("complainantName") as string) || undefined,
    respondentId: (formData.get("respondentId") as string) || undefined,
    respondentName: formData.get("respondentName") as string,
    incidentDate: formData.get("incidentDate") as string,
    incidentLocation: formData.get("incidentLocation") as string,
    narrative: formData.get("narrative") as string,
  };

  const parsed = blotterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  // Resolve names from resident IDs if selected
  const complainantName = parsed.data.complainantId
    ? await resolveResidentName(parsed.data.complainantId)
    : parsed.data.complainantName || null;

  const respondentName = parsed.data.respondentId
    ? ((await resolveResidentName(parsed.data.respondentId)) ??
      parsed.data.respondentName)
    : parsed.data.respondentName;

  try {
    const existing = await db.query.blotterCases.findFirst({
      where: eq(blotterCases.id, id),
    });

    if (!existing) return { error: "Case not found." };

    await db
      .update(blotterCases)
      .set({
        complainantId: parsed.data.complainantId || null,
        complainantName,
        respondentId: parsed.data.respondentId || null,
        respondentName,
        incidentDate: parsed.data.incidentDate,
        incidentLocation: parsed.data.incidentLocation,
        narrative: parsed.data.narrative,
        updatedAt: new Date(),
      })
      .where(
        and(eq(blotterCases.id, id), eq(blotterCases.barangayId, barangayId)),
      );

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "update",
      tableName: "blotter_cases",
      recordId: id,
      previousValue: existing,
      newValue: { ...existing, ...parsed.data },
    });

    revalidatePath("/admin/blotter");
    revalidatePath(`/admin/blotter/${id}`);
    return { success: true };
  } catch (e) {
    console.error("Error updating blotter case:", e);
    return { error: "Failed to update case. Please try again." };
  }
}

export async function updateBlotterStatusAction(
  id: string,
  status: "filed" | "under_mediation" | "settled" | "escalated" | "dismissed",
  resolution?: string,
): Promise<{ error?: string }> {
  const { admin, barangayId } = await requireBarangayAdmin();

  try {
    const existing = await db.query.blotterCases.findFirst({
      where: eq(blotterCases.id, id),
    });

    if (!existing) return { error: "Case not found." };

    await db
      .update(blotterCases)
      .set({
        status,
        resolution: resolution || null,
        resolvedAt: ["settled", "dismissed"].includes(status)
          ? new Date()
          : null,
        isEscalated: status === "escalated",
        escalatedAt: status === "escalated" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(
        and(eq(blotterCases.id, id), eq(blotterCases.barangayId, barangayId)),
      );

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "update",
      tableName: "blotter_cases",
      recordId: id,
      previousValue: existing,
      newValue: { ...existing, status },
    });

    revalidatePath("/admin/blotter");
    revalidatePath(`/admin/blotter/${id}`);
    return {};
  } catch (e) {
    console.error("Error updating blotter status:", e);
    return { error: "Failed to update case status." };
  }
}

export async function addProceedingAction(
  caseId: string,
  _prev: BlotterFormState,
  formData: FormData,
): Promise<BlotterFormState> {
  const { admin } = await requireBarangayAdmin();

  const raw = {
    proceedingDate: formData.get("proceedingDate") as string,
    notes: formData.get("notes") as string,
    nextHearingDate: (formData.get("nextHearingDate") as string) || undefined,
  };

  const parsed = proceedingSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    await db.insert(blotterProceedings).values({
      caseId,
      recordedById: admin.id,
      proceedingDate: parsed.data.proceedingDate,
      notes: parsed.data.notes,
      nextHearingDate: parsed.data.nextHearingDate || null,
    });

    // Auto update case to under_mediation if still filed
    const existingCase = await db.query.blotterCases.findFirst({
      where: eq(blotterCases.id, caseId),
    });

    if (existingCase?.status === "filed") {
      await db
        .update(blotterCases)
        .set({ status: "under_mediation", updatedAt: new Date() })
        .where(eq(blotterCases.id, caseId));
    }

    revalidatePath(`/admin/blotter/${caseId}`);
    revalidatePath("/admin/blotter");
    return { success: true };
  } catch (e) {
    console.error("Error adding proceeding:", e);
    return { error: "Failed to add proceeding. Please try again." };
  }
}

export async function escalateBlotterAction(
  id: string,
  reason: string,
): Promise<{ error?: string }> {
  const { admin, barangayId } = await requireBarangayAdmin();

  if (!reason || reason.length < 5) {
    return { error: "Please provide an escalation reason." };
  }

  try {
    await db
      .update(blotterCases)
      .set({
        status: "escalated",
        isEscalated: true,
        escalatedAt: new Date(),
        escalationReason: reason,
        updatedAt: new Date(),
      })
      .where(
        and(eq(blotterCases.id, id), eq(blotterCases.barangayId, barangayId)),
      );

    revalidatePath("/admin/blotter");
    revalidatePath(`/admin/blotter/${id}`);
    return {};
  } catch (e) {
    return { error: "Failed to escalate case." };
  }
}

export async function residentFileBlotterAction(
  _prev: BlotterFormState,
  formData: FormData,
): Promise<BlotterFormState> {
  const { resident: user, barangayId } = await requireResident();

  const raw = {
    respondentName: formData.get("respondentName") as string,
    incidentDate: formData.get("incidentDate") as string,
    incidentLocation: formData.get("incidentLocation") as string,
    narrative: formData.get("narrative") as string,
  };

  const parsed = residentBlotterSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const [resident] = await db
    .select({
      id: residents.id,
      firstName: residents.firstName,
      lastName: residents.lastName,
    })
    .from(residents)
    .where(eq(residents.userId, user.id))
    .limit(1);

  if (!resident) return { error: "Resident record not found." };

  try {
    const [newCase] = await db
      .insert(blotterCases)
      .values({
        barangayId,
        caseNumber: generateCaseNumber(),
        filedById: user.id,
        complainantId: resident.id,
        complainantName: `${resident.firstName} ${resident.lastName}`,
        respondentName: parsed.data.respondentName,
        incidentDate: parsed.data.incidentDate,
        incidentLocation: parsed.data.incidentLocation,
        narrative: parsed.data.narrative,
        status: "filed",
        isEscalated: false,
      })
      .returning();

    revalidatePath("/resident/blotter");
    return { success: true, caseId: newCase.id };
  } catch (e) {
    console.error("Error filing blotter:", e);
    return { error: "Failed to file complaint. Please try again." };
  }
}

export async function searchResidentsAction(query: string) {
  const { barangayId } = await requireBarangayAdmin();

  if (!query.trim()) return [];

  return db
    .select({
      id: residents.id,
      firstName: residents.firstName,
      middleName: residents.middleName,
      lastName: residents.lastName,
      suffix: residents.suffix,
    })
    .from(residents)
    .where(
      and(
        eq(residents.barangayId, barangayId),
        eq(residents.isArchived, false),
        or(
          ilike(residents.firstName, `%${query}%`),
          ilike(residents.lastName, `%${query}%`),
        ),
      ),
    )
    .orderBy(residents.lastName, residents.firstName)
    .limit(10);
}

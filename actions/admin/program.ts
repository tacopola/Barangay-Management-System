"use server";

import { db } from "@/db";
import { programs, programBeneficiaries } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireBarangayAdmin } from "@/lib/auth-helper";
import { createAuditLog } from "@/lib/audit/audit-log";

const enrollSchema = z.object({
  residentId: z.string().uuid("Invalid resident"),
  enrolledAt: z.string().min(1, "Enrollment date is required"),
  remarks: z.string().optional(),
});

const removeSchema = z.object({
  removalReason: z.string().min(1, "Reason is required"),
});

export type EnrollFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function searchEligibleResidentsAction(
  programId: string,
  search: string,
) {
  const { barangayId } = await requireBarangayAdmin();
  const { getEligibleResidents } = await import("@/db/queries/admin/program");
  return getEligibleResidents(barangayId, programId, search);
}

export async function enrollBeneficiaryAction(
  programId: string,
  _prev: EnrollFormState,
  formData: FormData,
): Promise<EnrollFormState> {
  const { admin, barangayId } = await requireBarangayAdmin();

  const raw = {
    residentId: formData.get("residentId") as string,
    enrolledAt: formData.get("enrolledAt") as string,
    remarks: (formData.get("remarks") as string) || undefined,
  };

  const parsed = enrollSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    // Verify program belongs to this barangay
    const program = await db.query.programs.findFirst({
      where: and(
        eq(programs.id, programId),
        eq(programs.barangayId, barangayId),
      ),
    });
    if (!program) return { error: "Program not found." };

    // Check not already active
    const existing = await db.query.programBeneficiaries.findFirst({
      where: and(
        eq(programBeneficiaries.programId, programId),
        eq(programBeneficiaries.residentId, parsed.data.residentId),
        isNull(programBeneficiaries.removedAt),
      ),
    });
    if (existing)
      return { error: "Resident is already an active beneficiary." };

    const [record] = await db
      .insert(programBeneficiaries)
      .values({
        programId,
        residentId: parsed.data.residentId,
        enrolledAt: parsed.data.enrolledAt,
        remarks: parsed.data.remarks,
      })
      .returning();

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "create",
      tableName: "program_beneficiaries",
      recordId: record.id,
      newValue: record,
    });

    revalidatePath(`/admin/programs/${programId}`);
    revalidatePath("/admin/programs");
    return { success: true };
  } catch (e) {
    console.error("Error enrolling beneficiary:", e);
    return { error: "Failed to enroll beneficiary. Please try again." };
  }
}

export async function removeBeneficiaryAction(
  beneficiaryId: string,
  programId: string,
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const { admin, barangayId } = await requireBarangayAdmin();

  const raw = { removalReason: formData.get("removalReason") as string };
  const parsed = removeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors.removalReason?.[0] };
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    const existing = await db.query.programBeneficiaries.findFirst({
      where: eq(programBeneficiaries.id, beneficiaryId),
    });
    if (!existing) return { error: "Beneficiary record not found." };

    await db
      .update(programBeneficiaries)
      .set({
        removedAt: today,
        removalReason: parsed.data.removalReason,
        updatedAt: new Date(),
      })
      .where(eq(programBeneficiaries.id, beneficiaryId));

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "update",
      tableName: "program_beneficiaries",
      recordId: beneficiaryId,
      previousValue: existing,
      newValue: { removedAt: today, removalReason: parsed.data.removalReason },
    });

    revalidatePath(`/admin/programs/${programId}`);
    revalidatePath("/admin/programs");
    return { success: true };
  } catch (e) {
    console.error("Error removing beneficiary:", e);
    return { error: "Failed to remove beneficiary." };
  }
}

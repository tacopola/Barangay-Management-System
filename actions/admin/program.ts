"use server";

import { db } from "@/db";
import { programs, programBeneficiaries } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireBarangayAdmin } from "@/lib/auth-helper";
import { createAuditLog } from "@/lib/audit/audit-log";
import { programTypeEnum } from "@/db/schema/enums";

const programSchema = z.object({
  name: z.string().min(1, "Program name is required").max(150),
  type: z.enum(programTypeEnum.enumValues, {
    message: "Program type is required",
  }),
  description: z.string().optional(),
});

const enrollSchema = z.object({
  residentId: z.string().uuid("Invalid resident"),
  enrolledAt: z.string().min(1, "Enrollment date is required"),
  remarks: z.string().optional(),
});

const removeSchema = z.object({
  removalReason: z.string().min(1, "Reason is required"),
});

export type ProgramFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export type EnrollFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function createProgramAction(
  _prev: ProgramFormState,
  formData: FormData,
): Promise<ProgramFormState> {
  const { admin, barangayId } = await requireBarangayAdmin();

  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = programSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const [program] = await db
      .insert(programs)
      .values({
        barangayId,
        name: parsed.data.name,
        type: parsed.data.type,
        description: parsed.data.description,
        isActive: true,
      })
      .returning();

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "create",
      tableName: "programs",
      recordId: program.id,
      newValue: program,
    });

    revalidatePath("/admin/programs");
    return { success: true };
  } catch (e) {
    console.error("Error creating program:", e);
    return { error: "Failed to create program. Please try again." };
  }
}

export async function updateProgramAction(
  id: string,
  _prev: ProgramFormState,
  formData: FormData,
): Promise<ProgramFormState> {
  const { admin, barangayId } = await requireBarangayAdmin();

  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = programSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const existing = await db.query.programs.findFirst({
      where: and(eq(programs.id, id), eq(programs.barangayId, barangayId)),
    });

    if (!existing) return { error: "Program not found." };

    await db
      .update(programs)
      .set({
        name: parsed.data.name,
        type: parsed.data.type,
        description: parsed.data.description,
        updatedAt: new Date(),
      })
      .where(and(eq(programs.id, id), eq(programs.barangayId, barangayId)));

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "update",
      tableName: "programs",
      recordId: id,
      previousValue: existing,
      newValue: { ...existing, ...parsed.data },
    });

    revalidatePath("/admin/programs");
    revalidatePath(`/admin/programs/${id}`);
    return { success: true };
  } catch (e) {
    console.error("Error updating program:", e);
    return { error: "Failed to update program. Please try again." };
  }
}

export async function toggleProgramStatusAction(
  id: string,
): Promise<{ error?: string }> {
  const { admin, barangayId } = await requireBarangayAdmin();

  try {
    const existing = await db.query.programs.findFirst({
      where: and(eq(programs.id, id), eq(programs.barangayId, barangayId)),
    });

    if (!existing) return { error: "Program not found." };

    const [updated] = await db
      .update(programs)
      .set({ isActive: !existing.isActive, updatedAt: new Date() })
      .where(and(eq(programs.id, id), eq(programs.barangayId, barangayId)))
      .returning();

    await createAuditLog({
      actorId: admin.id,
      barangayId,
      action: "update",
      tableName: "programs",
      recordId: id,
      previousValue: { isActive: existing.isActive },
      newValue: { isActive: updated.isActive },
    });

    revalidatePath("/admin/programs");
    revalidatePath(`/admin/programs/${id}`);
    return {};
  } catch (e) {
    console.error("Error toggling program status:", e);
    return { error: "Failed to update program status." };
  }
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
    // Check program belongs to barangay
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

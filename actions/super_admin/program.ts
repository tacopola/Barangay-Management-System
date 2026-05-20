"use server";

import { db } from "@/db";
import { programs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit/audit-log";
import { requireSuperAdmin } from "@/lib/auth-helper";

const programSchema = z.object({
  name: z.string().min(2, "Program name is required"),
  type: z.enum(["4ps", "senior_citizen", "pwd", "solo_parent", "indigent"], {
    message: "Please select a program type",
  }),
  barangayId: z.string().uuid("Please select a barangay"),
  description: z.string().optional(),
});

export type ProgramFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};


export async function createProgramAction(
  _prev: ProgramFormState,
  formData: FormData,
): Promise<ProgramFormState> {
  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    barangayId: formData.get("barangayId") as string,
    description: (formData.get("description") as string) || undefined,
  };
const { superadmin } = await requireSuperAdmin();
  const parsed = programSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const [created] = await db
      .insert(programs)
      .values({
        name: parsed.data.name,
        type: parsed.data.type,
        barangayId: parsed.data.barangayId,
        description: parsed.data.description,
        isActive: true,
      })
      .returning();

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: parsed.data.barangayId,
      action: "create",
      tableName: "programs",
      recordId: created.id,
      newValue: created,
    });

    revalidatePath("/super-admin/programs");
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
  const { superadmin } = await requireSuperAdmin();
  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    barangayId: formData.get("barangayId") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = programSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const [existing] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, id));

    const [updated] = await db
      .update(programs)
      .set({
        name: parsed.data.name,
        type: parsed.data.type,
        barangayId: parsed.data.barangayId,
        description: parsed.data.description,
        updatedAt: new Date(),
      })
      .where(eq(programs.id, id))
      .returning();

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: parsed.data.barangayId,
      action: "update",
      tableName: "programs",
      recordId: id,
      previousValue: existing,
      newValue: updated,
    });

    revalidatePath("/super-admin/programs");
    return { success: true };
  } catch (e) {
    console.error("Error updating program:", e);
    return { error: "Failed to update program. Please try again." };
  }
}


export async function toggleProgramStatusAction(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  const { superadmin } = await requireSuperAdmin();
  try {
    const [existing] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, id));

    const [updated] = await db
      .update(programs)
      .set({
        isActive: !isActive,
        updatedAt: new Date(),
      })
      .where(eq(programs.id, id))
      .returning();

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: existing.barangayId,
      action: "update",
      tableName: "programs",
      recordId: id,
      previousValue: existing,
      newValue: updated,
    });

    revalidatePath("/super-admin/programs");
    return {};
  } catch (e) {
    console.error("Error updating program status:", e);
    return { error: "Failed to update status." };
  }
}


export async function deleteProgramAction(
  id: string,
): Promise<{ error?: string }> {
  const { superadmin } = await requireSuperAdmin();
  try {
    const [existing] = await db
      .select()
      .from(programs)
      .where(eq(programs.id, id));

    await db.delete(programs).where(eq(programs.id, id));

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: existing?.barangayId ?? null,
      action: "delete",
      tableName: "programs",
      recordId: id,
      previousValue: existing,
    });

    revalidatePath("/super-admin/programs");
    return {};
  } catch (e) {
    console.error("Error deleting program:", e);
    return {
      error: "Cannot delete program. It may have existing beneficiaries.",
    };
  }
}

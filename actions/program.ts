"use server";

import { db } from "@/db";
import { programs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function createProgramAction(
  _prev: ProgramFormState,
  formData: FormData,
): Promise<ProgramFormState> {
  await requireRole("super_admin");

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
    await db.insert(programs).values({
      name: parsed.data.name,
      type: parsed.data.type,
      barangayId: parsed.data.barangayId,
      description: parsed.data.description,
      isActive: true,
    });

    revalidatePath("/super-admin/programs");
    return { success: true };
  } catch (e) {
    console.error("Error creating program:", e);
    return { error: "Failed to create program. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updateProgramAction(
  id: string,
  _prev: ProgramFormState,
  formData: FormData,
): Promise<ProgramFormState> {
  await requireRole("super_admin");

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
    await db
      .update(programs)
      .set({
        name: parsed.data.name,
        type: parsed.data.type,
        barangayId: parsed.data.barangayId,
        description: parsed.data.description,
        updatedAt: new Date(),
      })
      .where(eq(programs.id, id));

    revalidatePath("/super-admin/programs");
    return { success: true };
  } catch (e) {
    console.error("Error updating program:", e);
    return { error: "Failed to update program. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// Toggle active
// ---------------------------------------------------------------------------

export async function toggleProgramStatusAction(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  await requireRole("super_admin");

  try {
    await db
      .update(programs)
      .set({ isActive: !isActive, updatedAt: new Date() })
      .where(eq(programs.id, id));

    revalidatePath("/super-admin/programs");
    return {};
  } catch (e) {
    console.error("Error updating program status:", e);
    return { error: "Failed to update status." };
  }
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deleteProgramAction(
  id: string,
): Promise<{ error?: string }> {
  await requireRole("super_admin");

  try {
    await db.delete(programs).where(eq(programs.id, id));
    revalidatePath("/super-admin/programs");
    return {};
  } catch (e) {
    console.error("Error deleting program:", e);
    return {
      error: "Cannot delete program. It may have existing beneficiaries.",
    };
  }
}

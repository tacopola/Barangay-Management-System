"use server";

import { db } from "@/db";
import { barangayOfficials } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireBarangayAdmin } from "@/lib/auth-helper";

const officialSchema = z.object({
  residentId: z
    .string()
    .uuid("Please select a resident")
    .optional()
    .or(z.literal("")),
  position: z.enum([
    "punong_barangay",
    "kagawad",
    "sk_chairperson",
    "sk_kagawad",
    "barangay_secretary",
    "barangay_treasurer",
    "tanod",
  ]),
  termStart: z.string().min(1, "Term start date is required"),
  termEnd: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type OfficialFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  officialId?: string;
};

function parseOptional(formData: FormData, key: string) {
  const val = formData.get(key) as string;
  return val || undefined;
}

function parseCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "true";
}

export async function createOfficialAction(
  _prev: OfficialFormState,
  formData: FormData,
): Promise<OfficialFormState> {
  const { admin } = await requireBarangayAdmin();
  const barangayId = admin.barangayId!;
  const raw = {
    residentId: parseOptional(formData, "residentId"),
    position: formData.get("position") as string,
    termStart: formData.get("termStart") as string,
    termEnd: parseOptional(formData, "termEnd"),
    isActive: parseCheckbox(formData, "isActive"),
  };

  const parsed = officialSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const [newOfficial] = await db
      .insert(barangayOfficials)
      .values({
        barangayId,
        residentId: parsed.data.residentId || null,
        position: parsed.data.position,
        termStart: parsed.data.termStart,
        termEnd: parsed.data.termEnd ?? null,
        isActive: parsed.data.isActive,
      })
      .returning({ id: barangayOfficials.id });

    revalidatePath("/admin/officials");
    return { success: true, officialId: newOfficial.id };
  } catch (e) {
    console.error("Error creating official:", e);
    return { error: "Failed to create official. Please try again." };
  }
}

export async function updateOfficialAction(
  id: string,
  _prev: OfficialFormState,
  formData: FormData,
): Promise<OfficialFormState> {
  const { admin } = await requireBarangayAdmin();
  const raw = {
    residentId: parseOptional(formData, "residentId"),
    position: formData.get("position") as string,
    termStart: formData.get("termStart") as string,
    termEnd: parseOptional(formData, "termEnd"),
    isActive: parseCheckbox(formData, "isActive"),
  };

  const parsed = officialSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    await db
      .update(barangayOfficials)
      .set({
        residentId: parsed.data.residentId || null,
        position: parsed.data.position,
        termStart: parsed.data.termStart,
        termEnd: parsed.data.termEnd ?? null,
        isActive: parsed.data.isActive,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(barangayOfficials.id, id),
          eq(barangayOfficials.barangayId, admin.barangayId!),
        ),
      );

    revalidatePath("/admin/officials");
    return { success: true };
  } catch (e) {
    console.error("Error updating official:", e);
    return { error: "Failed to update official. Please try again." };
  }
}

export async function toggleOfficialActiveAction(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  const { admin } = await requireBarangayAdmin();
  try {
    await db
      .update(barangayOfficials)
      .set({ isActive: !isActive, updatedAt: new Date() })
      .where(
        and(
          eq(barangayOfficials.id, id),
          eq(barangayOfficials.barangayId, admin.barangayId!),
        ),
      );

    revalidatePath("/admin/officials");
    return {};
  } catch (e) {
    console.error("Error toggling official status:", e);
    return { error: "Failed to update official status." };
  }
}
export async function deleteOfficialAction(
  id: string,
): Promise<{ error?: string }> {
  const { admin } = await requireBarangayAdmin();
  try {
    await db
      .delete(barangayOfficials)
      .where(
        and(
          eq(barangayOfficials.id, id),
          eq(barangayOfficials.barangayId, admin.barangayId!),
        ),
      );

    revalidatePath("/admin/officials");
    return {};
  } catch (e) {
    console.error("Error deleting official:", e);
    return { error: "Failed to delete official." };
  }
}

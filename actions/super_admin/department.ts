"use server";

import { db } from "@/db";
import { departments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAuditLog } from "@/lib/audit/audit-log";
import { requireSuperAdmin } from "@/lib/auth-helper";
import { departmentTypeEnum } from "@/db/schema/enums";

export type DepartmentFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  type: z.enum(departmentTypeEnum.enumValues, {
    message: "Invalid department type",
  }),
  description: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

export async function createDepartmentAction(
  _prev: DepartmentFormState,
  formData: FormData,
): Promise<DepartmentFormState> {
  const { superadmin } = await requireSuperAdmin();

  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    description: (formData.get("description") as string) || undefined,
    contactNumber: (formData.get("contactNumber") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
  };

  const parsed = departmentSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const [created] = await db
      .insert(departments)
      .values({
        ...parsed.data,
        isActive: true,
      })
      .returning();

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: null,
      action: "create",
      tableName: "departments",
      recordId: created.id,
      newValue: created,
    });

    revalidatePath("/super-admin/departments");

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create department." };
  }
}

export async function updateDepartmentAction(
  id: string,
  _prev: DepartmentFormState,
  formData: FormData,
): Promise<DepartmentFormState> {
  const { superadmin } = await requireSuperAdmin();

  const raw = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    description: (formData.get("description") as string) || undefined,
    contactNumber: (formData.get("contactNumber") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
  };

  const parsed = departmentSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const existing = await db.query.departments.findFirst({
      where: eq(departments.id, id),
    });

    if (!existing) {
      return { error: "Department not found." };
    }

    await db
      .update(departments)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(departments.id, id));

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: null,
      action: "update",
      tableName: "departments",
      recordId: id,
      previousValue: existing,
      newValue: {
        ...existing,
        ...parsed.data,
      },
    });

    revalidatePath("/super-admin/departments");

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update department." };
  }
}

export async function toggleDepartmentStatusAction(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  try {
    await db
      .update(departments)
      .set({
        isActive: !isActive,
        updatedAt: new Date(),
      })
      .where(eq(departments.id, id));

    revalidatePath("/super-admin/departments");

    return {};
  } catch {
    return { error: "Failed to update status." };
  }
}

export async function deleteDepartmentAction(
  id: string,
): Promise<{ error?: string }> {
  try {
    await db.delete(departments).where(eq(departments.id, id));

    revalidatePath("/super-admin/departments");

    return {};
  } catch {
    return { error: "Failed to delete department." };
  }
}

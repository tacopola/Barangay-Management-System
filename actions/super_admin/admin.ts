"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createAuditLog } from "@/lib/audit/audit-log";
import { requireSuperAdmin } from "@/lib/auth-helper";

export type AdminFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

const createBarangayAdminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Invalid phone number"),
  barangayId: z.string().uuid("Please select a barangay"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updateBarangayAdminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Invalid phone number"),
  barangayId: z.string().uuid("Please select a barangay"),
});

const createDepartmentAdminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Invalid phone number"),
  departmentId: z.string().uuid("Please select a department"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updateDepartmentAdminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Invalid phone number"),
  departmentId: z.string().uuid("Please select a department"),
});


async function createAuthUser(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  return { data, error };
}


export async function createBarangayAdminAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { superadmin } = await requireSuperAdmin();

  const raw = {
    firstName: formData.get("firstName") as string,
    middleName: (formData.get("middleName") as string) || undefined,
    lastName: formData.get("lastName") as string,
    suffix: (formData.get("suffix") as string) || undefined,
    email: formData.get("email") as string,
    phoneNumber: formData.get("phoneNumber") as string,
    barangayId: formData.get("barangayId") as string,
    password: formData.get("password") as string,
  };

  const parsed = createBarangayAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const { data: authData, error: authError } = await createAuthUser(
    parsed.data.email,
    parsed.data.password,
  );

  if (authError || !authData.user) {
    if (authError?.message?.includes("already registered")) {
      return { error: "An account with this email already exists." };
    }
    return { error: authError?.message ?? "Failed to create account." };
  }

  try {
    const [created] = await db
      .insert(users)
      .values({
        authId: authData.user.id,
        role: "barangay_admin",
        barangayId: parsed.data.barangayId,
        firstName: parsed.data.firstName,
        middleName: parsed.data.middleName,
        lastName: parsed.data.lastName,
        suffix: parsed.data.suffix,
        email: parsed.data.email,
        phoneNumber: parsed.data.phoneNumber,
        isActive: true,
      })
      .returning();

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: superadmin.barangayId,
      action: "create",
      tableName: "users",
      recordId: created.id,
      newValue: created,
    });

    revalidatePath("/super-admin/admins");
    return { success: true };
  } catch (e) {
    console.error("Error creating barangay admin:", e);
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { error: "Failed to create admin. Please try again." };
  }
}


export async function updateBarangayAdminAction(
  id: string,
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { superadmin } = await requireSuperAdmin();

  const raw = {
    firstName: formData.get("firstName") as string,
    middleName: (formData.get("middleName") as string) || undefined,
    lastName: formData.get("lastName") as string,
    suffix: (formData.get("suffix") as string) || undefined,
    email: formData.get("email") as string,
    phoneNumber: formData.get("phoneNumber") as string,
    barangayId: formData.get("barangayId") as string,
  };

  const parsed = updateBarangayAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const existing = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!existing) return { error: "Admin not found." };

    await db
      .update(users)
      .set({
        firstName: parsed.data.firstName,
        middleName: parsed.data.middleName,
        lastName: parsed.data.lastName,
        suffix: parsed.data.suffix,
        email: parsed.data.email,
        phoneNumber: parsed.data.phoneNumber,
        barangayId: parsed.data.barangayId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: superadmin.barangayId,
      action: "update",
      tableName: "users",
      recordId: id,
      previousValue: existing,
      newValue: { ...existing, ...parsed.data },
    });

    revalidatePath("/super-admin/admins");
    return { success: true };
  } catch (e) {
    console.error("Error updating barangay admin:", e);
    return { error: "Failed to update admin. Please try again." };
  }
}

export async function createDepartmentAdminAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { superadmin } = await requireSuperAdmin();

  const raw = {
    firstName: formData.get("firstName") as string,
    middleName: (formData.get("middleName") as string) || undefined,
    lastName: formData.get("lastName") as string,
    suffix: (formData.get("suffix") as string) || undefined,
    email: formData.get("email") as string,
    phoneNumber: formData.get("phoneNumber") as string,
    departmentId: formData.get("departmentId") as string,
    password: formData.get("password") as string,
  };

  const parsed = createDepartmentAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const { data: authData, error: authError } = await createAuthUser(
    parsed.data.email,
    parsed.data.password,
  );

  if (authError || !authData.user) {
    if (authError?.message?.includes("already registered")) {
      return { error: "An account with this email already exists." };
    }
    return { error: authError?.message ?? "Failed to create account." };
  }

  try {
    const [created] = await db
      .insert(users)
      .values({
        authId: authData.user.id,
        role: "department_admin",
        departmentId: parsed.data.departmentId,
        firstName: parsed.data.firstName,
        middleName: parsed.data.middleName,
        lastName: parsed.data.lastName,
        suffix: parsed.data.suffix,
        email: parsed.data.email,
        phoneNumber: parsed.data.phoneNumber,
        isActive: true,
      })
      .returning();

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: null,
      action: "create",
      tableName: "users",
      recordId: created.id,
      newValue: created,
    });

    revalidatePath("/super-admin/admins");
    return { success: true };
  } catch (e) {
    console.error("Error creating department admin:", e);
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { error: "Failed to create admin. Please try again." };
  }
}


export async function updateDepartmentAdminAction(
  id: string,
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const { superadmin } = await requireSuperAdmin();

  const raw = {
    firstName: formData.get("firstName") as string,
    middleName: (formData.get("middleName") as string) || undefined,
    lastName: formData.get("lastName") as string,
    suffix: (formData.get("suffix") as string) || undefined,
    email: formData.get("email") as string,
    phoneNumber: formData.get("phoneNumber") as string,
    departmentId: formData.get("departmentId") as string,
  };

  const parsed = updateDepartmentAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    const existing = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!existing) return { error: "Admin not found." };

    await db
      .update(users)
      .set({
        firstName: parsed.data.firstName,
        middleName: parsed.data.middleName,
        lastName: parsed.data.lastName,
        suffix: parsed.data.suffix,
        email: parsed.data.email,
        phoneNumber: parsed.data.phoneNumber,
        departmentId: parsed.data.departmentId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: null,
      action: "update",
      tableName: "users",
      recordId: id,
      previousValue: existing,
      newValue: { ...existing, ...parsed.data },
    });

    revalidatePath("/super-admin/admins");
    return { success: true };
  } catch (e) {
    console.error("Error updating department admin:", e);
    return { error: "Failed to update admin. Please try again." };
  }
}

export async function toggleAdminStatusAction(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  const { superadmin } = await requireSuperAdmin();

  try {
    const existing = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!existing) return { error: "Admin not found." };

    await db
      .update(users)
      .set({ isActive: !isActive, updatedAt: new Date() })
      .where(eq(users.id, id));

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: superadmin.barangayId,
      action: "update",
      tableName: "users",
      recordId: id,
      previousValue: existing,
      newValue: { ...existing, isActive: !isActive },
    });

    revalidatePath("/super-admin/admins");
    return {};
  } catch (e) {
    console.error("Error toggling admin status:", e);
    return { error: "Failed to update status." };
  }
}

export async function resetAdminPasswordAction(
  authId: string,
  newPassword: string,
): Promise<{ error?: string }> {
  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(authId, {
    password: newPassword,
  });

  if (error) return { error: "Failed to reset password." };
  return {};
}

export async function deleteAdminAction(
  id: string,
  authId: string,
): Promise<{ error?: string }> {
  const { superadmin } = await requireSuperAdmin();

  try {
    const existing = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!existing) return { error: "Admin not found." };

    await createAuditLog({
      actorId: superadmin.id,
      barangayId: superadmin.barangayId,
      action: "delete",
      tableName: "users",
      recordId: id,
      previousValue: existing,
    });

    await db.delete(users).where(eq(users.id, id));
    await supabaseAdmin.auth.admin.deleteUser(authId);

    revalidatePath("/super-admin/admins");
    return {};
  } catch (e) {
    console.error("Error deleting admin:", e);
    return { error: "Failed to delete admin." };
  }
}

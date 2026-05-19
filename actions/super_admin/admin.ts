"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createAuditLog } from "@/lib/audit/audit-log";

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const createAdminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Invalid phone number"),
  barangayId: z.string().uuid("Please select a barangay"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const updateAdminSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Invalid phone number"),
  barangayId: z.string().uuid("Please select a barangay"),
});

export type AdminFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

// ---------------------------------------------------------------------------
// Create admin account
// ---------------------------------------------------------------------------

export async function createAdminAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const actor = await requireRole("super_admin");

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

  const parsed = createAdminSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  // ---------------------------------------------------------------------------
  // Create auth user
  // ---------------------------------------------------------------------------

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    if (authError?.message?.includes("already registered")) {
      return {
        error: "An account with this email already exists.",
      };
    }

    return {
      error: authError?.message ?? "Failed to create account.",
    };
  }

  // ---------------------------------------------------------------------------
  // Create public user
  // ---------------------------------------------------------------------------

  try {
    const [createdUser] = await db
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

    // -----------------------------------------------------------------------
    // Audit log
    // -----------------------------------------------------------------------

    await createAuditLog({
      actorId: actor.id,
      barangayId: actor.barangayId,

      action: "create",

      tableName: "users",
      recordId: createdUser.id,

      newValue: createdUser,
    });

    revalidatePath("/super-admin/admins");

    return {
      success: true,
    };
  } catch (e) {
    console.error("Error creating admin:", e);

    // Rollback auth user
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

    return {
      error: "Failed to create admin. Please try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// Update admin info
// ---------------------------------------------------------------------------

export async function updateAdminAction(
  id: string,
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const actor = await requireRole("super_admin");

  const raw = {
    firstName: formData.get("firstName") as string,
    middleName: (formData.get("middleName") as string) || undefined,
    lastName: formData.get("lastName") as string,
    suffix: (formData.get("suffix") as string) || undefined,
    email: formData.get("email") as string,
    phoneNumber: formData.get("phoneNumber") as string,
    barangayId: formData.get("barangayId") as string,
  };

  const parsed = updateAdminSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  try {
    // -----------------------------------------------------------------------
    // Existing user
    // -----------------------------------------------------------------------

    const existing = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existing) {
      return {
        error: "Admin not found.",
      };
    }

    // -----------------------------------------------------------------------
    // Update
    // -----------------------------------------------------------------------

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

    // -----------------------------------------------------------------------
    // Audit log
    // -----------------------------------------------------------------------

    await createAuditLog({
      actorId: actor.id,
      barangayId: actor.barangayId,

      action: "update",

      tableName: "users",
      recordId: id,

      previousValue: existing,

      newValue: {
        ...existing,

        firstName: parsed.data.firstName,
        middleName: parsed.data.middleName,
        lastName: parsed.data.lastName,
        suffix: parsed.data.suffix,

        email: parsed.data.email,
        phoneNumber: parsed.data.phoneNumber,

        barangayId: parsed.data.barangayId,
      },
    });

    revalidatePath("/super-admin/admins");

    return {
      success: true,
    };
  } catch (e) {
    console.error("Error updating admin:", e);

    return {
      error: "Failed to update admin. Please try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// Toggle active status
// ---------------------------------------------------------------------------

export async function toggleAdminStatusAction(
  id: string,
  isActive: boolean,
): Promise<{ error?: string }> {
  const actor = await requireRole("super_admin");

  try {
    // -----------------------------------------------------------------------
    // Existing user
    // -----------------------------------------------------------------------

    const existing = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existing) {
      return {
        error: "Admin not found.",
      };
    }

    // -----------------------------------------------------------------------
    // Update
    // -----------------------------------------------------------------------

    await db
      .update(users)
      .set({
        isActive: !isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));

    // -----------------------------------------------------------------------
    // Audit log
    // -----------------------------------------------------------------------

    await createAuditLog({
      actorId: actor.id,
      barangayId: actor.barangayId,

      action: "update",

      tableName: "users",
      recordId: id,

      previousValue: existing,

      newValue: {
        ...existing,
        isActive: !isActive,
      },
    });

    revalidatePath("/super-admin/admins");

    return {};
  } catch (e) {
    console.error("Error toggling admin status:", e);

    return {
      error: "Failed to update status.",
    };
  }
}

// ---------------------------------------------------------------------------
// Reset password
// ---------------------------------------------------------------------------

export async function resetAdminPasswordAction(
  authId: string,
  newPassword: string,
): Promise<{ error?: string }> {
  await requireRole("super_admin");

  if (newPassword.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
    };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(authId, {
    password: newPassword,
  });

  if (error) {
    return {
      error: "Failed to reset password.",
    };
  }

  return {};
}

// ---------------------------------------------------------------------------
// Delete admin
// ---------------------------------------------------------------------------

export async function deleteAdminAction(
  id: string,
  authId: string,
): Promise<{ error?: string }> {
  const actor = await requireRole("super_admin");

  try {
    // -----------------------------------------------------------------------
    // Existing user
    // -----------------------------------------------------------------------

    const existing = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!existing) {
      return {
        error: "Admin not found.",
      };
    }

    // -----------------------------------------------------------------------
    // Audit log BEFORE delete
    // -----------------------------------------------------------------------

    await createAuditLog({
      actorId: actor.id,
      barangayId: actor.barangayId,

      action: "delete",

      tableName: "users",
      recordId: id,

      previousValue: existing,
    });

    // -----------------------------------------------------------------------
    // Delete db user
    // -----------------------------------------------------------------------

    await db.delete(users).where(eq(users.id, id));

    // -----------------------------------------------------------------------
    // Delete auth user
    // -----------------------------------------------------------------------

    await supabaseAdmin.auth.admin.deleteUser(authId);

    revalidatePath("/super-admin/admins");

    return {};
  } catch (e) {
    console.error("Error deleting admin:", e);

    return {
      error: "Failed to delete admin.",
    };
  }
}

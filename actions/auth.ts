"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ROLE_HOME } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit/audit-log";

const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const residentLoginSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Invalid phone number")
    .regex(/^[0-9+\-\s]+$/, "Invalid phone number format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type ActionResult = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function adminLoginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = adminLoginSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return {
      error: "Invalid email or password.",
    };
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.authId, data.user.id))
    .limit(1);

  if (!dbUser) {
    await supabase.auth.signOut();

    return {
      error: "Account not found. Contact your administrator.",
    };
  }

  if (dbUser.role === "resident") {
    await supabase.auth.signOut();

    return {
      error: "Please use the resident login instead.",
    };
  }

  if (!dbUser.isActive) {
    await supabase.auth.signOut();

    return {
      error: "Your account has been deactivated.",
    };
  }

  await createAuditLog({
    actorId: dbUser.id,
    barangayId: dbUser.barangayId,
    action: "update",
    tableName: "auth",
    recordId: dbUser.id,
    newValue: {
      event: "admin_login",
      role: dbUser.role,
      email: dbUser.email,
      loggedInAt: new Date().toISOString(),
    },
  });

  redirect(ROLE_HOME[dbUser.role as keyof typeof ROLE_HOME]);
}

export async function residentLoginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const raw = {
    phoneNumber: formData.get("phoneNumber") as string,
    password: formData.get("password") as string,
  };

  const parsed = residentLoginSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const generatedEmail = `${parsed.data.phoneNumber.replace(/\s+/g, "")}@bms.com`;

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: generatedEmail,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    return {
      error: "Invalid phone number or password.",
    };
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.authId, data.user.id))
    .limit(1);

  if (!dbUser || !dbUser.isActive) {
    await supabase.auth.signOut();

    return {
      error: "Account deactivated. Contact your barangay.",
    };
  }

  await createAuditLog({
    actorId: dbUser.id,
    barangayId: dbUser.barangayId,
    action: "update",
    tableName: "auth",
    recordId: dbUser.id,
    newValue: {
      event: "resident_login",
      role: dbUser.role,
      loggedInAt: new Date().toISOString(),
    },
  });

  redirect(ROLE_HOME.resident);
}

export async function logoutAdminAction() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.authId, user.id))
      .limit(1);

    if (dbUser) {
      await createAuditLog({
        actorId: dbUser.id,
        barangayId: dbUser.barangayId,
        action: "update",
        tableName: "auth",
        recordId: dbUser.id,
        newValue: {
          event: "admin_logout",
          role: dbUser.role,
          loggedOutAt: new Date().toISOString(),
        },
      });
    }
  }

  await supabase.auth.signOut();

  redirect("/auth/admin-login");
}

export async function logoutResidentAction() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.authId, user.id))
      .limit(1);

    if (dbUser) {
      await createAuditLog({
        actorId: dbUser.id,
        barangayId: dbUser.barangayId,
        action: "update",
        tableName: "auth",
        recordId: dbUser.id,
        newValue: {
          event: "resident_logout",
          role: dbUser.role,
          loggedOutAt: new Date().toISOString(),
        },
      });
    }
  }

  await supabase.auth.signOut();

  redirect("/auth/resident-login");
}

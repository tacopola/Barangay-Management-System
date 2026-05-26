import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users, departments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";

export type UserRole =
  | "super_admin"
  | "barangay_admin"
  | "resident"
  | "department_admin";

export type AuthUser = {
  id: string;
  authId: string;
  role: UserRole;
  barangayId: string | null;
  departmentId: string | null;
  departmentType: string | null; 
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
};

export const ROLE_HOME: Record<UserRole, string> = {
  super_admin: "/super-admin",
  barangay_admin: "/barangay-admin",
  resident: "/resident",
  department_admin: "/department-admin",
};

export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const [row] = await db
      .select({
        id: users.id,
        authId: users.authId,
        role: users.role,
        barangayId: users.barangayId,
        departmentId: users.departmentId,
        departmentType: departments.type,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .leftJoin(departments, eq(users.departmentId, departments.id))
      .where(eq(users.authId, user.id))
      .limit(1);

    if (!row) return null;

    return {
      id: row.id,
      authId: row.authId,
      role: row.role as UserRole,
      barangayId: row.barangayId,
      departmentId: row.departmentId,
      departmentType: row.departmentType ?? null,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      phoneNumber: row.phoneNumber,
    };
  } catch {
    return null;
  }
});

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user)
    redirect(
      "/auth/resident/login?error=You must be logged in to access this page.",
    );
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) redirect(ROLE_HOME[user.role]);
  return user;
}

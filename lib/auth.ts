import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { roleEnum } from "@/db/schema/enums";

export type UserRole = (typeof roleEnum.enumValues)[number];

export type AuthUser = {
  id: string;
  authId: string;
  role: UserRole;
  barangayId: string | null;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
};

export const ROLE_HOME: Record<UserRole, string> = {
  super_admin: "/super-admin",
  barangay_admin: "/admin",
  resident: "/resident",
  department_admin: "/department-admin",
};

// cache() ensures this runs once per request no matter
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const [dbUser] = await db
      .select({
        id: users.id,
        authId: users.authId,
        role: users.role,
        barangayId: users.barangayId,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(eq(users.authId, user.id))
      .limit(1);

    if (!dbUser) return null;

    return {
      id: dbUser.id,
      authId: dbUser.authId,
      role: dbUser.role as UserRole,
      barangayId: dbUser.barangayId,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      email: dbUser.email,
      phoneNumber: dbUser.phoneNumber,
    };
  } catch {
    return null;
  }
});

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) redirect("/auth/login");
  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!roles.includes(user.role)) redirect(ROLE_HOME[user.role]);
  return user;
}

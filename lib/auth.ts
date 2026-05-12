import { createClient } from "@/lib/supabase/server"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"

export type UserRole = "super_admin" | "barangay_admin" | "resident"

export type AuthUser = {
  id: string
  authId: string
  role: UserRole
  barangayId: string | null
  firstName: string
  lastName: string
  email: string | null
  phoneNumber: string | null
}

// Role-based home routes
export const ROLE_HOME: Record<UserRole, string> = {
  super_admin: "/super-admin",
  barangay_admin: "/admin",
  resident: "/resident",
}

// Get the current logged-in user with their role from public.users
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.authId, user.id))
    .limit(1)

  if (!dbUser) return null

  return {
    id: dbUser.id,
    authId: dbUser.authId,
    role: dbUser.role as UserRole,
    barangayId: dbUser.barangayId,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    email: dbUser.email,
    phoneNumber: dbUser.phoneNumber,
  }
}

// Use in server components/actions — redirects if not authenticated
export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser()
  if (!user) redirect("/auth/resident-login")
  return user
}

// Use in server components/actions — redirects if wrong role
export async function requireRole(
  ...roles: UserRole[]
): Promise<AuthUser> {
  const user = await requireAuth()
  if (!roles.includes(user.role)) {
    redirect(ROLE_HOME[user.role])
  }
  return user
}
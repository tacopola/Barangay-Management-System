import { requireRole } from "@/lib/auth"
import { db } from "@/db"
import { users, barangays } from "@/db/schema"
import { eq } from "drizzle-orm"
import { AdminListClient } from "@/components/super-admin/admin_tab/admin-list-client"

async function getAdmins() {
  const admins = await db
    .select({
      id: users.id,
      authId: users.authId,
      firstName: users.firstName,
      middleName: users.middleName,
      lastName: users.lastName,
      suffix: users.suffix,
      email: users.email,
      phoneNumber: users.phoneNumber,
      isActive: users.isActive,
      barangayId: users.barangayId,
      barangayName: barangays.name,
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(barangays, eq(users.barangayId, barangays.id))
    .where(eq(users.role, "barangay_admin"))
    .orderBy(users.lastName)

  return admins
}

async function getAllBarangays() {
  return db
    .select({ id: barangays.id, name: barangays.name })
    .from(barangays)
    .where(eq(barangays.isActive, true))
    .orderBy(barangays.name)
}

export default async function AdminsPage() {
  await requireRole("super_admin")
  const [admins, allBarangays] = await Promise.all([getAdmins(), getAllBarangays()])

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Super Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Barangay Admins</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage admin and secretary accounts for each barangay.
        </p>
      </div>
      <AdminListClient admins={admins} barangays={allBarangays} />
    </div>
  )
}
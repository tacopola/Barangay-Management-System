import { db } from "@/db";
import { users, barangays, departments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getBarangayAdmins = unstable_cache(
  async () => {
    return db
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
      .orderBy(users.lastName);
  },
  ["barangay-admins-list"],
  { revalidate: 60 },
);

export const getDepartmentAdmins = unstable_cache(
  async () => {
    return db
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
        departmentId: users.departmentId,
        departmentName: departments.name,
        departmentType: departments.type,
        createdAt: users.createdAt,
      })
      .from(users)
      .leftJoin(departments, eq(users.departmentId, departments.id))
      .where(eq(users.role, "department_admin"))
      .orderBy(users.lastName);
  },
  ["department-admins-list"],
  { revalidate: 60 },
);

export const getAllBarangays = unstable_cache(
  async () => {
    return db
      .select({ id: barangays.id, name: barangays.name })
      .from(barangays)
      .where(eq(barangays.isActive, true))
      .orderBy(barangays.name);
  },
  ["active-barangays"],
  { revalidate: 300 },
);

export const getAllDepartments = unstable_cache(
  async () => {
    return db
      .select({
        id: departments.id,
        name: departments.name,
        type: departments.type,
      })
      .from(departments)
      .where(eq(departments.isActive, true))
      .orderBy(departments.name);
  },
  ["active-departments"],
  { revalidate: 300 },
);

import { db } from "@/db";
import { users, barangays } from "@/db/schema";
import { eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getAdmins = unstable_cache(
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
  ["admins-list"],
  {
    revalidate: 60,
  },
);

export const getAllBarangays = unstable_cache(
  async () => {
    return db
      .select({
        id: barangays.id,
        name: barangays.name,
      })
      .from(barangays)
      .where(eq(barangays.isActive, true))
      .orderBy(barangays.name);
  },
  ["active-barangays"],
  {
    revalidate: 300,
  },
);

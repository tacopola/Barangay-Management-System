import { db } from "@/db";
import { departments, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getDepartments = unstable_cache(
  async () => {
    return db
      .select({
        id: departments.id,
        name: departments.name,
        type: departments.type,
        description: departments.description,
        contactNumber: departments.contactNumber,
        email: departments.email,
        isActive: departments.isActive,
        adminCount: sql<number>`
          count(case when ${users.role} = 'department_admin' then 1 end)
        `,
      })
      .from(departments)
      .leftJoin(users, eq(users.departmentId, departments.id))
      .groupBy(departments.id);
  },
  ["departments-list"],
  { revalidate: 60 },
);

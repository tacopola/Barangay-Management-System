import { db } from "@/db";
import { barangays, users, residents } from "@/db/schema";
import { eq, count, and } from "drizzle-orm";
import { unstable_cache } from "next/cache";

async function getBarangaysWithStatsRaw() {
  const all = await db.select().from(barangays).orderBy(barangays.name);

  const withStats = await Promise.all(
    all.map(async (b) => {
      const [adminCount] = await db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            eq(users.barangayId, b.id),
            eq(users.role, "barangay_admin"),
            eq(users.isActive, true),
          ),
        );

      const [residentCount] = await db
        .select({ count: count() })
        .from(residents)
        .where(
          and(eq(residents.barangayId, b.id), eq(residents.isArchived, false)),
        );

      return {
        ...b,
        adminCount: adminCount.count,
        residentCount: residentCount.count,
      };
    }),
  );

  return withStats;
}

export const getBarangaysWithStats = unstable_cache(
  async () => {
    return getBarangaysWithStatsRaw();
  },
  ["barangays-with-stats"],
  {
    revalidate: 60,
  },
);

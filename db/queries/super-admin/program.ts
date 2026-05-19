import { db } from "@/db";
import { programs, barangays, programBeneficiaries } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { unstable_cache } from "next/cache";

async function getProgramsWithStatsRaw() {
  const all = await db
    .select({
      id: programs.id,
      name: programs.name,
      type: programs.type,
      description: programs.description,
      isActive: programs.isActive,
      barangayId: programs.barangayId,
      barangayName: barangays.name,
      createdAt: programs.createdAt,
    })
    .from(programs)
    .leftJoin(barangays, eq(programs.barangayId, barangays.id))
    .orderBy(programs.name);

  const withStats = await Promise.all(
    all.map(async (p) => {
      const [beneficiaryCount] = await db
        .select({ count: count() })
        .from(programBeneficiaries)
        .where(eq(programBeneficiaries.programId, p.id));

      return {
        ...p,
        beneficiaryCount: beneficiaryCount.count,
      };
    }),
  );

  return withStats;
}

export const getProgramsWithStats = unstable_cache(
  async () => {
    return getProgramsWithStatsRaw();
  },
  ["programs-with-stats"],
  {
    revalidate: 60,
  },
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
  {
    revalidate: 300,
  },
);

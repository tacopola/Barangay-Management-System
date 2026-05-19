import { db } from "@/db";
import {
  barangays,
  residents,
  documentRequests,
  blotterCases,
} from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getSuperAdminStats = unstable_cache(
  async () => {
    const [totalBarangays] = await db
      .select({ count: count() })
      .from(barangays);

    const [totalResidents] = await db
      .select({ count: count() })
      .from(residents);

    const [pendingDocs] = await db
      .select({ count: count() })
      .from(documentRequests)
      .where(eq(documentRequests.status, "pending"));

    const [activeBlotters] = await db
      .select({ count: count() })
      .from(blotterCases)
      .where(eq(blotterCases.status, "filed"));

    return {
      totalBarangays: totalBarangays.count,
      totalResidents: totalResidents.count,
      pendingDocs: pendingDocs.count,
      activeBlotters: activeBlotters.count,
    };
  },
  ["super-admin-stats"],
  {
    revalidate: 60, 
  }
);


export const getAllBarangays = unstable_cache(
  async () => {
    return db
      .select()
      .from(barangays)
      .orderBy(barangays.name);
  },
  ["all-barangays"],
  {
    revalidate: 300, 
  }
);
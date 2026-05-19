import { db } from "@/db";
import {
  residents,
  documentRequests,
  blotterCases,
  households,
  barangays,
} from "@/db/schema";
import { eq, count, and } from "drizzle-orm";
import { unstable_cache } from "next/cache";


export const getAdminStats = (barangayId: string) =>
  unstable_cache(
    async () => {
      const [totalResidents] = await db
        .select({ count: count() })
        .from(residents)
        .where(
          and(
            eq(residents.barangayId, barangayId),
            eq(residents.isArchived, false)
          )
        );

      const [totalHouseholds] = await db
        .select({ count: count() })
        .from(households)
        .where(eq(households.barangayId, barangayId));

      const [pendingDocs] = await db
        .select({ count: count() })
        .from(documentRequests)
        .where(
          and(
            eq(documentRequests.barangayId, barangayId),
            eq(documentRequests.status, "pending")
          )
        );

      const [activeBlotters] = await db
        .select({ count: count() })
        .from(blotterCases)
        .where(
          and(
            eq(blotterCases.barangayId, barangayId),
            eq(blotterCases.status, "filed")
          )
        );

      return {
        totalResidents: totalResidents.count,
        totalHouseholds: totalHouseholds.count,
        pendingDocs: pendingDocs.count,
        activeBlotters: activeBlotters.count,
      };
    },
    [`admin-stats-${barangayId}`],
    { revalidate: 60 }
  )();


export const getRecentDocRequests = (barangayId: string) =>
  unstable_cache(
    async () => {
      return db
        .select()
        .from(documentRequests)
        .where(eq(documentRequests.barangayId, barangayId))
        .orderBy(documentRequests.createdAt)
        .limit(6);
    },
    [`recent-docs-${barangayId}`],
    { revalidate: 30 }
  )();


export const getRecentBlotter = (barangayId: string) =>
  unstable_cache(
    async () => {
      return db
        .select()
        .from(blotterCases)
        .where(eq(blotterCases.barangayId, barangayId))
        .orderBy(blotterCases.createdAt)
        .limit(6);
    },
    [`recent-blotter-${barangayId}`],
    { revalidate: 30 }
  )();


export const getBarangayName = (barangayId: string) =>
  unstable_cache(
    async () => {
      const [brgy] = await db
        .select({ name: barangays.name })
        .from(barangays)
        .where(eq(barangays.id, barangayId))
        .limit(1);

      return brgy?.name ?? "Barangay";
    },
    [`barangay-name-${barangayId}`],
    { revalidate: 300 }
  )();
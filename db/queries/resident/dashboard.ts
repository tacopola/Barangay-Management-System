import { db } from "@/db";
import {
  residents,
  documentRequests,
  blotterCases,
  announcements,
} from "@/db/schema";
import { eq, and, desc, isNull, or, gt } from "drizzle-orm";

export async function getResidentData(userId: string, barangayId: string) {
  const [resident] = await db
    .select()
    .from(residents)
    .where(eq(residents.userId, userId))
    .limit(1);

  if (!resident) return null;

  const recentDocs = await db
    .select()
    .from(documentRequests)
    .where(eq(documentRequests.residentId, resident.id))
    .orderBy(desc(documentRequests.createdAt))
    .limit(3);

  const recentBlotter = await db
    .select()
    .from(blotterCases)
    .where(eq(blotterCases.complainantId, resident.id))
    .orderBy(desc(blotterCases.createdAt))
    .limit(2);

  const feed = await db
    .select()
    .from(announcements)
    .where(
      and(
        or(
          eq(announcements.barangayId, barangayId),
          isNull(announcements.barangayId)
        ),
        or(
          isNull(announcements.expiresAt),
          gt(announcements.expiresAt, new Date())
        )
      )
    )
    .orderBy(
      desc(announcements.isPinned),
      desc(announcements.createdAt)
    )
    .limit(10);

  return {
    resident,
    recentDocs,
    recentBlotter,
    feed,
  };
}
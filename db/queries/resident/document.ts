import { db } from "@/db";
import { documentRequests, residents } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getMyRequests(userId: string) {
  const [resident] = await db
    .select({ id: residents.id })
    .from(residents)
    .where(eq(residents.userId, userId))
    .limit(1);

  if (!resident) return [];

  return db
    .select()
    .from(documentRequests)
    .where(eq(documentRequests.residentId, resident.id))
    .orderBy(desc(documentRequests.createdAt));
}
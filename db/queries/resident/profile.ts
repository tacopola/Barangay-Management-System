import { db } from "@/db";
import { residents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getResidentProfile(userId: string) {
  const [resident] = await db
    .select()
    .from(residents)
    .where(eq(residents.userId, userId))
    .limit(1);

  return resident ?? null;
}
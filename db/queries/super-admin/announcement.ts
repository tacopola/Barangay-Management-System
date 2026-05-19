import { db } from "@/db";
import { announcements, barangays, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getAnnouncements = unstable_cache(
  async () => {
    return db
      .select({
        id: announcements.id,
        title: announcements.title,
        body: announcements.body,
        isPinned: announcements.isPinned,
        expiresAt: announcements.expiresAt,
        createdAt: announcements.createdAt,

        barangayId: announcements.barangayId,
        barangayName: barangays.name,

        postedBy: sql<string>`
          concat(${users.firstName}, ' ', ${users.lastName})
        `,
      })
      .from(announcements)
      .leftJoin(barangays, eq(announcements.barangayId, barangays.id))
      .leftJoin(users, eq(announcements.postedById, users.id))
      .orderBy(
        desc(announcements.isPinned),
        desc(announcements.createdAt)
      );
  },
  ["announcements-list"],
  {
    revalidate: 30, 
  }
);


export const getBarangays = unstable_cache(
  async () => {
    return db
      .select()
      .from(barangays)
      .orderBy(barangays.name);
  },
  ["barangays-list"],
  {
    revalidate: 300,
  }
);
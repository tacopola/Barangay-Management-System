import { db } from "@/db";
import { announcements, users } from "@/db/schema";
import { eq, or, isNull, desc } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getAnnouncements = (barangayId: string) =>
  unstable_cache(
    async () => {
      return db
        .select({
          id: announcements.id,
          title: announcements.title,
          body: announcements.body,
          isPinned: announcements.isPinned,
          expiresAt: announcements.expiresAt,
          barangayId: announcements.barangayId,
          createdAt: announcements.createdAt,
          postedByFirstName: users.firstName,
          postedByLastName: users.lastName,
        })
        .from(announcements)
        .leftJoin(users, eq(announcements.postedById, users.id))
        .where(
          or(
            eq(announcements.barangayId, barangayId), // barangay's own
            isNull(announcements.barangayId), // municipality-wide
          ),
        )
        .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));
    },
    [`announcements-${barangayId}`],
    { revalidate: 60 },
  )();

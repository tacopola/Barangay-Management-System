// app/super-admin/announcements/page.tsx

import { requireRole } from "@/lib/auth";
import { db } from "@/db";
import { announcements, barangays, users } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { AnnouncementListClient } from "@/components/super-admin/announcement_tab/announcement-list-client";

async function getAnnouncements() {
  const data = await db
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
    .orderBy(desc(announcements.isPinned), desc(announcements.createdAt));

  return data;
}

async function getBarangays() {
  return db.select().from(barangays).orderBy(barangays.name);
}

export default async function AnnouncementsPage() {
  await requireRole("super_admin");

  const [announcementData, barangayData] = await Promise.all([
    getAnnouncements(),
    getBarangays(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Super Admin
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Publish announcements across all barangays or target a specific
          barangay.
        </p>
      </div>

      <AnnouncementListClient
        announcements={announcementData}
        barangays={barangayData}
      />
    </div>
  );
}

import {
  getAnnouncements,
  getBarangays,
} from "@/db/queries/super-admin/announcement";

import { AnnouncementListClient } from "@/components/super-admin/announcement_tab/announcement-list-client";

export default async function AnnouncementsPage() {
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

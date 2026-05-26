import { requireBarangayAdmin } from "@/lib/auth-helper";
import { getAnnouncements } from "@/db/queries/barangay-admin/announcement";
import { AnnouncementsClient } from "@/components/barangay-admin/announcements/announcement-client";

export default async function AnnouncementsPage() {
  const { barangayId } = await requireBarangayAdmin();
  const items = await getAnnouncements(barangayId);

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Barangay Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Post and manage announcements for your barangay residents.
        </p>
      </div>
      <AnnouncementsClient announcements={items} />
    </div>
  );
}

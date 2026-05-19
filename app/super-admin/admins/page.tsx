import { getAdmins, getAllBarangays } from "@/db/queries/super-admin/admin";
import { AdminListClient } from "@/components/super-admin/admin_tab/admin-list-client";

export default async function AdminsPage() {
  const [admins, allBarangays] = await Promise.all([
    getAdmins(),
    getAllBarangays(),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Super Admin
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Barangay Admins
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage admin and secretary accounts for each barangay.
        </p>
      </div>

      <AdminListClient admins={admins} barangays={allBarangays} />
    </div>
  );
}
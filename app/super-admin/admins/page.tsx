import {
  getBarangayAdmins,
  getDepartmentAdmins,
  getAllBarangays,
  getAllDepartments,
} from "@/db/queries/super-admin/admin";

import { AdminListClient } from "@/components/super-admin/admins/admin-list-client";

export default async function AdminsPage() {
  const [barangayAdmins, departmentAdmins, allBarangays, allDepartments] =
    await Promise.all([
      getBarangayAdmins(),
      getDepartmentAdmins(),
      getAllBarangays(),
      getAllDepartments(),
    ]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Super Admin
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">
          Admin Management
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          Manage barangay and department administrator accounts.
        </p>
      </div>

      <AdminListClient
        barangayAdmins={barangayAdmins}
        departmentAdmins={departmentAdmins}
        barangays={allBarangays}
        departments={allDepartments}
      />
    </div>
  );
}

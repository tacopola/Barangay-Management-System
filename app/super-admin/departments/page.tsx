import { getDepartments } from "@/db/queries/super-admin/departments";
import { DepartmentListClient } from "@/components/super-admin/departments/department-list-client";

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <div className="p-6 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
          Super Admin
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Manage municipal departments and offices.
        </p>
      </div>

      <DepartmentListClient departments={departments} />
    </div>
  );
}

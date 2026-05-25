import { redirect } from "next/navigation";
import { requireDepartmentAdmin } from "@/lib/auth-helper";

export default async function DepartmentAdminPage() {
  const { admin } = await requireDepartmentAdmin();

  const departmentType = admin.departmentType;

  if (!departmentType) {
    redirect("/unauthorized");
  }

  redirect(`/department-admin/${departmentType}`);
}

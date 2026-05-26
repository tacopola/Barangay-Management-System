import { ReactNode } from "react";
import { requireDepartmentAdminOf } from "@/lib/auth-helper";
import { DeptShell } from "@/components/department-admin/shell/dept-shell";

export default async function MayorOfficeLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireDepartmentAdminOf("mayor_office");
  return <DeptShell deptType="mayor_office">{children}</DeptShell>;
}

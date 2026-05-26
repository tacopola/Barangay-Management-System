import { ReactNode } from "react";
import { requireDepartmentAdminOf } from "@/lib/auth-helper";
import { DeptShell } from "@/components/department-admin/shell/dept-shell";

export default async function TreasuryLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireDepartmentAdminOf("treasury");
  return <DeptShell deptType="treasury">{children}</DeptShell>;
}

import { ReactNode } from "react";
import { requireDepartmentAdmin } from "@/lib/auth-helper";
import { redirect } from "next/navigation";

export default async function DepartmentAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireDepartmentAdmin();

  return (
  <div className="min-h-screen bg-muted/30">
    {children}
  </div>);
}

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireDepartmentAdminOf } from "@/lib/auth-helper";

export default async function TreasuryLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireDepartmentAdminOf("treasury");
    return children;
  } catch {
    redirect("/department-admin");
  }
}

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { requireDepartmentAdminOf } from "@/lib/auth-helper";

export default async function MayorOfficeLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await requireDepartmentAdminOf("mayor_office");

    return children;
  } catch {
    redirect("/department-admin");
  }
}

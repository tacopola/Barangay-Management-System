import { ReactNode } from "react";
import { requireDepartmentAdminOf } from "@/lib/auth-helper";

export default async function Layout({
  children,
}: {
  children: ReactNode;
}) {
  await requireDepartmentAdminOf("vice_mayor_office");
  return children;
}
import { ReactNode } from "react";
import { requireDepartmentAdminOf } from "@/lib/auth-helper";

export default async function Layout({
  children,
}: {
  children: ReactNode;
}) {
  await requireDepartmentAdminOf("assessor");
  return children;
}
import { ReactNode } from "react";
import { requireDepartmentAdminOf } from "@/lib/auth-helper";

export default async function Layout({
  children,
}: {
  children: ReactNode;
}) {
  await requireDepartmentAdminOf("sb_office");
  return children;
}
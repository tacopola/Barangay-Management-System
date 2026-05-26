import { requireSuperAdmin } from "@/lib/auth-helper";
import { SuperAdminSidebar } from "@/components/super-admin/dashboard/super-admin-sidebar";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { superadmin } = await requireSuperAdmin();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SuperAdminSidebar user={superadmin} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}

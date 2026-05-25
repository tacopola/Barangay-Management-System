import { requireBarangayAdmin } from "@/lib/auth-helper";
import { AdminSidebar } from "@/components/admin/dashboard/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { admin } = await requireBarangayAdmin();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AdminSidebar user={admin} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
